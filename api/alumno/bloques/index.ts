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
      const bloques = await db.bloqueAlumno.findMany({
        where: { alumnoId: req.user!.id },
        include: {
          bloque: {
            include: {
              profesor: { select: { id: true, nombre: true, email: true } },
              modulos: { select: { id: true, estado: true, fecha: true } },
              alumnos: { select: { alumnoId: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const resultado = bloques.map((ba) => ({
        ...ba.bloque,
        alumnosCount: ba.bloque.alumnos.length,
      }));

      return sendSuccess(res, resultado, 200, 'Bloques obtenidos exitosamente');
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (error) {
    return handleError(res, error);
  }
});
