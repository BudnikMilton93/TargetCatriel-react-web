// Servidor de desarrollo local para las funciones serverless en /api.
// Emula el ruteo de Vercel (index.ts, [id].ts, etc.) para poder probar
// la API en localhost sin necesitar `vercel dev` ni una cuenta de Vercel.
//
// Uso: node --loader ts-node/esm scripts/dev-api-server.ts
import { createServer } from 'node:http';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cargar variables de entorno desde .env (tsx no lo hace automáticamente)
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}
const API_DIR = join(__dirname, '..', 'api');
const PORT = Number(process.env.API_PORT) || 3000;

type Segment = { literal: string } | { dynamic: string };
type Route = { segments: Segment[]; filePath: string };

function collectApiFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  let files: string[] = [];
  for (const entry of entries) {
    if (entry === '_lib') continue;
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files = files.concat(collectApiFiles(fullPath));
    } else if (entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function buildRoutes(): Route[] {
  const files = collectApiFiles(API_DIR);
  return files.map((filePath) => {
    const rel = relative(API_DIR, filePath).replace(/\.ts$/, '');
    let parts = rel.split('/');
    if (parts[parts.length - 1] === 'index') parts = parts.slice(0, -1);
    const segments: Segment[] = parts.map((part) => {
      const match = part.match(/^\[(.+)\]$/);
      return match ? { dynamic: match[1] } : { literal: part };
    });
    return { segments, filePath };
  });
}

const routes = buildRoutes();

function matchRoute(pathSegments: string[]) {
  const candidates = routes.filter((r) => r.segments.length === pathSegments.length);
  let best: { route: Route; params: Record<string, string>; dynamicCount: number } | null = null;

  for (const route of candidates) {
    const params: Record<string, string> = {};
    let ok = true;
    let dynamicCount = 0;
    for (let i = 0; i < route.segments.length; i++) {
      const seg = route.segments[i];
      const value = pathSegments[i];
      if ('literal' in seg) {
        if (seg.literal !== value) {
          ok = false;
          break;
        }
      } else {
        params[seg.dynamic] = value;
        dynamicCount++;
      }
    }
    if (ok && (!best || dynamicCount < best.dynamicCount)) {
      best = { route, params, dynamicCount };
    }
  }

  return best;
}

async function readBody(req: import('node:http').IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  if (chunks.length === 0) return undefined;
  const raw = Buffer.concat(chunks).toString('utf-8');
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://localhost:${PORT}`);
    const pathname = url.pathname;

    if (!pathname.startsWith('/api/')) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }

    const pathSegments = pathname.replace(/^\/api\//, '').split('/').filter(Boolean);
    const match = matchRoute(pathSegments);

    if (!match) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Endpoint no encontrado' }));
      return;
    }

    const query: Record<string, string | string[]> = { ...match.params };
    for (const [key, value] of url.searchParams.entries()) {
      query[key] = value;
    }

    const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')
      ? await readBody(req)
      : undefined;

    (req as any).query = query;
    (req as any).body = body;

    // Cache-bust por mtime: si el archivo de la ruta cambió desde el último
    // import, Node lo tratará como un módulo nuevo y lo volverá a evaluar.
    // Sin esto, el import() dinámico queda cacheado para siempre y hay que
    // reiniciar el servidor manualmente cada vez que se edita un endpoint.
    const fileMtime = statSync(match.route.filePath).mtimeMs;
    const moduleUrl = `${pathToFileURL(match.route.filePath).href}?v=${fileMtime}`;
    const mod = await import(moduleUrl);
    const handler = mod.default;

    await handler(req, res);
  } catch (error) {
    console.error('Error en dev API server:', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Error interno del servidor' }));
    }
  }
});

server.listen(PORT, () => {
  console.log(`API de desarrollo escuchando en http://localhost:${PORT}`);
  console.log(`${routes.length} rutas cargadas desde /api`);
});
