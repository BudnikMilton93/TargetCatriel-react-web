import type { ServerResponse } from 'http';
import { db } from '../../_lib/db';
import { sendSuccess, sendError, handleError } from '../../_lib/response';
import { withAuth } from '../../_lib/auth';
import { requireRole } from '../../_lib/roles';
import { AuthenticatedRequest } from '../../_lib/types';

export default withAuth(async (req: AuthenticatedRequest, res: ServerResponse) => {
  try {
    const { id } = req.query;

    requireRole('alumno')(req.user);

    if (!id || typeof id !== 'string') {
      return sendError(res, 400, 'ID de bloque requerido');
    }

    if (req.method === 'GET') {
      const inscripcion = await db.bloqueAlumno.findUnique({
        where: {
          bloqueId_alumnoId: {
            bloqueId: id,
            alumnoId: req.user!.id,
          },
        },
        include: {
          bloque: {
            include: {
              profesor: { select: { id: true, nombre: true, email: true } },
            },
          },
        },
      });

      if (!inscripcion) {
        return sendError(res, 403, 'No estás inscrito en este bloque');
      }

      const modulos = await db.modulo.findMany({
        where: { bloqueId: id, estado: { not: 'oculto' } },
        include: {
          contenidos: { orderBy: { orden: 'asc' } },
          asistencias: { where: { alumnoId: req.user!.id } },
        },
        orderBy: { fecha: 'asc' },
      });

      return sendSuccess(
        res,
        { bloque: inscripcion.bloque, modulos },
        200,
        'Módulos obtenidos exitosamente'
      );
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (error) {
    return handleError(res, error);
  }
});
