import type { ServerResponse } from 'http';
import { db } from '../../_lib/db';
import { sendSuccess, sendError, handleError } from '../../_lib/response';
import { withAuth } from '../../_lib/auth';
import { requireRole } from '../../_lib/auth';
import { AuthenticatedRequest } from '../../_lib/types';

export default withAuth(async (req: AuthenticatedRequest, res: ServerResponse) => {
  try {
    const method = req.method?.toUpperCase();

    if (method !== 'GET') {
      return sendError(res, 405, 'Metodo no permitido');
    }

    requireRole('profesor', 'administrador')(req.user);

    const bloqueId = typeof req.query?.bloqueId === 'string' ? req.query.bloqueId : undefined;
    const q = typeof req.query?.q === 'string' ? req.query.q.trim() : '';

    if (!bloqueId) {
      return sendError(res, 400, 'ID de bloque requerido');
    }

    const bloque = await db.bloque.findUnique({
      where: { id: bloqueId },
      select: { id: true, profesorId: true },
    });

    if (!bloque) {
      return sendError(res, 404, 'Bloque no encontrado');
    }

    if (bloque.profesorId !== req.user!.id && !req.user!.roles.includes('administrador')) {
      return sendError(res, 403, 'No tienes permisos para gestionar alumnos en este bloque');
    }

    const alumnosInscritos = await db.bloqueAlumno.findMany({
      where: { bloqueId },
      select: { alumnoId: true },
    });

    const idsInscritos = alumnosInscritos.map((registro) => registro.alumnoId);

    const candidatos = await db.alumnoPerfil.findMany({
      where: {
        usuario: {
          AND: [
            {
              roles: {
                some: {
                  rol: { nombre: 'alumno' },
                },
              },
            },
            ...(q
              ? [
                  {
                    OR: [
                      { nombre: { contains: q, mode: 'insensitive' as const } },
                      { email: { contains: q, mode: 'insensitive' as const } },
                    ],
                  },
                ]
              : []),
          ],
        },
        ...(idsInscritos.length > 0
          ? {
              usuarioId: {
                notIn: idsInscritos,
              },
            }
          : {}),
      },
      select: {
        usuarioId: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      take: 20,
      orderBy: {
        usuario: {
          nombre: 'asc',
        },
      },
    });

    return sendSuccess(res, candidatos, 200, 'Candidatos obtenidos exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
});
