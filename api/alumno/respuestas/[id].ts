import type { ServerResponse } from 'http';
import { db } from '../../_lib/db';
import { sendSuccess, sendError, handleError } from '../../_lib/response';
import { withAuth, logAudit } from '../../_lib/auth';
import { requireRole } from '../../_lib/roles';
import { AuthenticatedRequest } from '../../_lib/types';

export default withAuth(async (req: AuthenticatedRequest, res: ServerResponse) => {
  try {
    const { id } = req.query;

    requireRole('alumno')(req.user);

    if (!id || typeof id !== 'string') {
      return sendError(res, 400, 'ID de respuesta requerido');
    }

    const respuesta = await db.respuesta.findUnique({
      where: { id },
      include: { contenido: { include: { modulo: true } } },
    });

    if (!respuesta) {
      return sendError(res, 404, 'Respuesta no encontrada');
    }

    if (respuesta.alumnoId !== req.user!.id) {
      return sendError(res, 403, 'No puedes editar respuestas de otros alumnos');
    }

    if (req.method === 'PUT') {
      const { respuestaActualizada, visibilidad } = req.body;

      const updated = await db.respuesta.update({
        where: { id },
        data: {
          ...(respuestaActualizada && { respuesta: respuestaActualizada }),
          ...(visibilidad && { visibilidad }),
        },
        include: {
          contenido: { select: { tipo: true, contenido: true } },
        },
      });

      await logAudit(req.user!.id, 'ACTUALIZAR', 'RESPUESTA', { respuestaId: id });

      return sendSuccess(res, updated, 200, 'Respuesta actualizada exitosamente');
    }

    if (req.method === 'DELETE') {
      await db.respuesta.delete({
        where: { id },
      });

      await logAudit(req.user!.id, 'ELIMINAR', 'RESPUESTA', { respuestaId: id });

      return sendSuccess(res, { id }, 200, 'Respuesta eliminada exitosamente');
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (error) {
    return handleError(res, error);
  }
});
