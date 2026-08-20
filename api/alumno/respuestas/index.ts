import type { ServerResponse } from 'http';
import { db } from '../../_lib/db';
import { sendSuccess, sendError, handleError } from '../../_lib/response';
import { withAuth, logAudit } from '../../_lib/auth';
import { requireRole } from '../../_lib/roles';
import { AuthenticatedRequest } from '../../_lib/types';

export default withAuth(async (req: AuthenticatedRequest, res: ServerResponse) => {
  try {
    requireRole('alumno')(req.user);

    if (req.method === 'GET') {
      const shared = req.query?.shared === 'true' || req.query?.shared === '1';
      const bloqueId = typeof req.query?.bloqueId === 'string' ? req.query.bloqueId : undefined;

      const inscripciones = await db.bloqueAlumno.findMany({
        where: { alumnoId: req.user!.id },
        select: { bloqueId: true },
      });

      const bloquesPermitidos = inscripciones.map((inscripcion) => inscripcion.bloqueId);

      if (shared) {
        const respuestas = await db.respuesta.findMany({
          where: {
            visibilidad: 'compartido',
            contenido: {
              modulo: {
                bloqueId: bloqueId ? bloqueId : { in: bloquesPermitidos },
              },
            },
          },
          include: {
            contenido: {
              select: {
                id: true,
                tipo: true,
                contenido: true,
                modulo: { select: { id: true, fecha: true, estado: true } },
              },
            },
            alumno: {
              select: {
                usuario: { select: { nombre: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        return sendSuccess(res, respuestas, 200, 'Respuestas compartidas obtenidas exitosamente');
      }

      const respuestas = await db.respuesta.findMany({
        where: { alumnoId: req.user!.id },
        include: {
          contenido: {
            include: {
              modulo: { select: { id: true, fecha: true, estado: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, respuestas, 200, 'Respuestas obtenidas exitosamente');
    }

    if (req.method === 'POST') {
      const { contenidoId, respuesta, visibilidad } = req.body;

      if (!contenidoId || !respuesta) {
        return sendError(res, 400, 'Contenido y respuesta son requeridos');
      }

      const contenido = await db.contenido.findUnique({
        where: { id: contenidoId },
        include: { modulo: { include: { bloque: true } } },
      });

      if (!contenido) {
        return sendError(res, 404, 'Contenido no encontrado');
      }

      const inscripcion = await db.bloqueAlumno.findUnique({
        where: {
          bloqueId_alumnoId: {
            bloqueId: contenido.modulo.bloque.id,
            alumnoId: req.user!.id,
          },
        },
      });

      if (!inscripcion) {
        return sendError(res, 403, 'No estás inscrito en este bloque');
      }

      const nuevaRespuesta = await db.respuesta.create({
        data: {
          contenidoId,
          alumnoId: req.user!.id,
          respuesta,
          visibilidad: visibilidad || 'privado',
        },
        include: {
          contenido: { select: { tipo: true, contenido: true } },
        },
      });

      await logAudit(req.user!.id, 'CREAR', 'RESPUESTA', {
        respuestaId: nuevaRespuesta.id,
        contenidoId,
      });

      return sendSuccess(res, nuevaRespuesta, 201, 'Respuesta creada exitosamente');
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (error) {
    return handleError(res, error);
  }
});
