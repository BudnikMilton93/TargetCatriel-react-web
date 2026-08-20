import type { ServerResponse } from 'http';
import { db } from '../../_lib/db';
import { sendSuccess, sendError, handleError } from '../../_lib/response';
import { withAuth } from '../../_lib/auth';
import { requireRole } from '../../_lib/roles';
import { AuthenticatedRequest } from '../../_lib/types';

export default withAuth(async (req: AuthenticatedRequest, res: ServerResponse) => {
  try {
    requireRole('alumno')(req.user);

    if (req.method === 'GET') {
      const asistencias = await db.asistencia.findMany({
        where: { alumnoId: req.user!.id },
        include: {
          modulo: {
            select: {
              id: true,
              fecha: true,
              estado: true,
              bloque: { select: { nivel: true, dias: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const total = asistencias.length;
      const presentes = asistencias.filter((a) => a.presente).length;
      const ausentes = total - presentes;
      const porcentaje = total > 0 ? ((presentes / total) * 100).toFixed(2) : '0';

      return sendSuccess(
        res,
        {
          asistencias,
          estadisticas: {
            total,
            presentes,
            ausentes,
            porcentajeAsistencia: parseFloat(porcentaje),
          },
        },
        200,
        'Asistencias obtenidas exitosamente'
      );
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (error) {
    return handleError(res, error);
  }
});
