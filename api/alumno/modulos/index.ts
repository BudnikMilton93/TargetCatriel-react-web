import type { ServerResponse } from 'http';
import { db } from '../../_lib/db';
import { sendSuccess, sendError, handleError } from '../../_lib/response';
import { withAuth } from '../../_lib/auth';
import { requireRole } from '../../_lib/roles';
import { AuthenticatedRequest } from '../../_lib/types';

export default withAuth(async (req: AuthenticatedRequest, res: ServerResponse) => {
  try {
    requireRole('alumno')(req.user);

    if (req.method !== 'GET') {
      return sendError(res, 405, 'Método no permitido');
    }

    const bloqueId = typeof req.query?.bloqueId === 'string' ? req.query.bloqueId : undefined;

    const inscripciones = await db.bloqueAlumno.findMany({
      where: { alumnoId: req.user!.id },
      select: { bloqueId: true },
    });

    const bloquesPermitidos = inscripciones.map((inscripcion) => inscripcion.bloqueId);

    if (bloqueId && !bloquesPermitidos.includes(bloqueId)) {
      return sendError(res, 403, 'No estás inscrito en este bloque');
    }

    const modulos = await db.modulo.findMany({
      where: {
        bloqueId: bloqueId ? bloqueId : { in: bloquesPermitidos },
        estado: 'habilitado',
      },
      include: {
        bloque: {
          select: {
            id: true,
            nivel: true,
            dias: true,
            anio: true,
            horaInicio: true,
            horaFin: true,
            profesor: { select: { id: true, nombre: true, email: true } },
          },
        },
        contenidos: {
          orderBy: { orden: 'asc' },
        },
      },
      orderBy: { fecha: 'asc' },
    });

    return sendSuccess(res, modulos, 200, 'Módulos del alumno obtenidos exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
});
