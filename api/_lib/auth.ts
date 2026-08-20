import type { ServerResponse } from 'http';
import { AuthenticatedRequest, AuthenticatedUser, ErrorMessages, ApiError } from './types';
import { getUserRoles, requireRole } from './roles';
import { sendError } from './response';
import { db } from './db';

export { requireRole } from './roles';

/**
 * Extrae y valida el token del header Authorization
 * Formato: Authorization: Bearer <token>
 */
export function extractToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

/**
 * En producción, esto validaría un JWT real de Supabase.
 * Para desarrollo local, permite tokens simples (usuario_id)
 */
export async function validateToken(token: string): Promise<AuthenticatedUser | null> {
  try {
    // En desarrollo: el token es simplemente el usuario_id
    const usuarioId = token;

    // Buscar usuario
    const usuario = await db.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) return null;

    // Obtener roles
    const roles = await getUserRoles(usuarioId);

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      roles,
    };
  } catch (error) {
    console.error('Error validando token:', error);
    return null;
  }
}

/**
 * Middleware para autenticar la request
 * Busca el token en el header Authorization
 */
export async function authenticateRequest(
  req: AuthenticatedRequest,
): Promise<void> {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    throw new ApiError(401, ErrorMessages.UNAUTHORIZED);
  }

  const user = await validateToken(token);

  if (!user) {
    throw new ApiError(401, ErrorMessages.UNAUTHORIZED);
  }

  req.user = user;
}

/**
 * Envuelve un handler para agregar autenticación automática
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, res: ServerResponse) => Promise<any>,
) {
  return async (req: AuthenticatedRequest, res: ServerResponse) => {
    try {
      await authenticateRequest(req);
      return await handler(req, res);
    } catch (error) {
      if (error instanceof ApiError) {
        return sendError(res, error.statusCode, error.message);
      }
      return sendError(res, 500, ErrorMessages.INTERNAL_ERROR);
    }
  };
}

/**
 * Log de auditoría para acciones
 */
export async function logAudit(
  usuarioId: string,
  accion: string,
  entidad: string,
  detalles: any = {},
) {
  console.log(`[AUDIT] ${new Date().toISOString()} | Usuario: ${usuarioId} | Acción: ${accion} | Entidad: ${entidad}`, detalles);
  // En producción, guardar en tabla de auditoría
}
