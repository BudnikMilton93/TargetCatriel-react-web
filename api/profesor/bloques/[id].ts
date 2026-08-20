import type { ServerResponse } from 'http';
import { db } from '../../_lib/db';
import { sendSuccess, sendError, handleError } from '../../_lib/response';
import { withAuth, logAudit, requireRole } from '../../_lib/auth';
import { hasRole } from '../../_lib/roles';
import type { AuthenticatedRequest } from '../../_lib/types';

export default withAuth(async (req: AuthenticatedRequest, res: ServerResponse) => {
  try {
    const rawId = req.query?.id ?? req.body?.id;
    const id = typeof rawId === 'string' ? rawId : undefined;
    const method = req.method?.toUpperCase();

    if (!id || typeof id !== 'string') {
      return sendError(res, 400, 'ID de bloque requerido');
    }

    // Validar rol
    requireRole('profesor', 'administrador')(req.user);

    // Verificar que el bloque existe
    const bloque = await db.bloque.findUnique({
      where: { id },
      include: {
        profesor: { select: { id: true, nombre: true, email: true } },
        alumnos: { include: { alumno: true } },
        modulos: true,
      },
    });

    if (!bloque) {
      return sendError(res, 404, 'Bloque no encontrado');
    }

    // Solo el profesor propietario o admin pueden operar
    if (bloque.profesorId !== req.user!.id && !hasRole(req.user!.roles, 'administrador')) {
      return sendError(res, 403, 'No tienes permisos para acceder a este bloque');
    }

    if (method === 'GET') {
      return sendSuccess(res, bloque, 200, 'Bloque obtenido exitosamente');
    }

    if (method === 'PUT') {
      const { nivel, dias, horaInicio, horaFin, anio } = req.body;

      if (nivel && nivel !== bloque.nivel) {
        const respuestasCount = await db.respuesta.count({
          where: {
            contenido: {
              modulo: {
                bloqueId: id,
              },
            },
          },
        });

        if (respuestasCount > 0) {
          return sendError(
            res,
            409,
            'No puedes cambiar el nivel de este bloque porque ya tiene actividades con respuestas de alumnos.'
          );
        }
      }

      const bloqueActualizado = await db.bloque.update({
        where: { id },
        data: {
          ...(nivel && { nivel }),
          ...(dias && { dias }),
          ...(horaInicio && { horaInicio: new Date(horaInicio) }),
          ...(horaFin && { horaFin: new Date(horaFin) }),
          ...(anio && { anio }),
        },
        include: {
          profesor: { select: { id: true, nombre: true, email: true } },
          alumnos: { include: { alumno: true } },
          modulos: true,
        },
      });

      await logAudit(req.user!.id, 'ACTUALIZAR', 'BLOQUE', { bloqueId: id });

      return sendSuccess(res, bloqueActualizado, 200, 'Bloque actualizado exitosamente');
    }

    if (method === 'DELETE') {
      const respuestasCount = await db.respuesta.count({
        where: {
          contenido: {
            modulo: {
              bloqueId: id,
            },
          },
        },
      });

      if (respuestasCount > 0) {
        return sendError(
          res,
          409,
          'No puedes eliminar este bloque porque tiene actividades con respuestas de alumnos.'
        );
      }

      await db.bloque.delete({
        where: { id },
      });

      await logAudit(req.user!.id, 'ELIMINAR', 'BLOQUE', { bloqueId: id });

      return sendSuccess(res, { id }, 200, 'Bloque eliminado exitosamente');
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (error) {
    return handleError(res, error);
  }
});
