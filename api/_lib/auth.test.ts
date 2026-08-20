import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// `db` es un singleton de PrismaClient (ver api/_lib/db.ts). Se mockea el
// módulo completo antes de importar auth.ts para no tocar una base real.
vi.mock('./db', () => ({
  db: {
    registroAuditoria: {
      create: vi.fn(),
    },
  },
}));

import { db } from './db';
import { extractToken, logAudit } from './auth';

describe('logAudit', () => {
  const createMock = vi.mocked(db.registroAuditoria.create);

  beforeEach(() => {
    createMock.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('persiste el registro con los datos recibidos', async () => {
    createMock.mockResolvedValueOnce({} as any);

    await logAudit('usuario-1', 'crear', 'Noticia', { titulo: 'Nueva noticia' });

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith({
      data: {
        usuarioId: 'usuario-1',
        accion: 'crear',
        entidad: 'Noticia',
        detalles: { titulo: 'Nueva noticia' },
      },
    });
  });

  it('usa un objeto vacío como default cuando no se pasan detalles', async () => {
    createMock.mockResolvedValueOnce({} as any);

    await logAudit('usuario-1', 'eliminar', 'Galeria');

    expect(createMock).toHaveBeenCalledWith({
      data: {
        usuarioId: 'usuario-1',
        accion: 'eliminar',
        entidad: 'Galeria',
        detalles: {},
      },
    });
  });

  it('no propaga la excepción si falla la escritura en la base de datos', async () => {
    const dbError = new Error('conexión rechazada');
    createMock.mockRejectedValueOnce(dbError);

    await expect(
      logAudit('usuario-1', 'editar', 'Modulo', { campo: 'nombre' }),
    ).resolves.toBeUndefined();
  });

  it('loguea el error con contexto cuando falla la persistencia', async () => {
    const dbError = new Error('conexión rechazada');
    createMock.mockRejectedValueOnce(dbError);
    const consoleErrorSpy = vi.spyOn(console, 'error');

    await logAudit('usuario-42', 'editar', 'Modulo', { campo: 'nombre' });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const [message, loggedError] = consoleErrorSpy.mock.calls[0];
    expect(message).toContain('usuario-42');
    expect(message).toContain('editar');
    expect(message).toContain('Modulo');
    expect(loggedError).toBe(dbError);
  });
});

describe('extractToken', () => {
  it('extrae el token de un header "Bearer <token>" válido', () => {
    expect(extractToken('Bearer abc123')).toBe('abc123');
  });

  it('devuelve null si no hay header', () => {
    expect(extractToken(undefined)).toBeNull();
  });

  it('devuelve null si el esquema no es "Bearer"', () => {
    expect(extractToken('Basic abc123')).toBeNull();
  });

  it('devuelve null si el header tiene un formato inválido', () => {
    expect(extractToken('Bearer')).toBeNull();
    expect(extractToken('Bearer a b')).toBeNull();
  });
});
