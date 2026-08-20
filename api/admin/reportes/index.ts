import type { ServerResponse } from 'http';
import { db } from '../../_lib/db';
import { sendSuccess, sendError, handleError } from '../../_lib/response';
import { withAuth } from '../../_lib/auth';
import { requireRole } from '../../_lib/roles';
import { AuthenticatedRequest } from '../../_lib/types';

export default withAuth(async (req: AuthenticatedRequest, res: ServerResponse) => {
  try {
    requireRole('administrador')(req.user);

    if (req.method === 'GET') {
      const { tipo } = req.query;

      if (tipo === 'actividades') {
        const actividades = await db.respuesta.findMany({
          take: 50,
          include: {
            alumno: { select: { usuarioId: true, usuario: { select: { nombre: true } } } },
            contenido: { select: { tipo: true, contenido: true } },
          },
          orderBy: { createdAt: 'desc' },
        });

        return sendSuccess(res, actividades, 200, 'Actividades obtenidas');
      }

      if (tipo === 'asistencias') {
        const modulos = await db.modulo.findMany({
          include: {
            bloque: { select: { nivel: true, dias: true } },
            asistencias: true,
          },
        });

        const resumen = modulos.map((modulo) => {
          const asistencias = modulo.asistencias;
          const presentes = asistencias.filter((a) => a.presente).length;
          const total = asistencias.length;
          return {
            moduloId: modulo.id,
            fecha: modulo.fecha,
            nivel: modulo.bloque.nivel,
            presentes,
            ausentes: total - presentes,
            total,
            porcentaje: total > 0 ? ((presentes / total) * 100).toFixed(2) : '0',
          };
        });

        return sendSuccess(res, resumen, 200, 'Resumen de asistencias obtenido');
      }

      if (tipo === 'progreso') {
        const alumnos = await db.alumnoPerfil.findMany({
          include: {
            usuario: { select: { nombre: true, email: true } },
            bloques: {
              include: {
                bloque: { select: { nivel: true } },
              },
            },
            respuestas: true,
            asistencias: true,
          },
        });

        const progreso = alumnos.map((alumno) => {
          const bloques = alumno.bloques.map((ba) => ba.bloque.nivel);
          const totalRespuestas = alumno.respuestas.length;
          const totalAsistencias = alumno.asistencias.length;
          const asistenciasPresentes = alumno.asistencias.filter((a) => a.presente).length;

          return {
            alumnoId: alumno.usuarioId,
            nombre: alumno.usuario.nombre,
            email: alumno.usuario.email,
            bloques,
            respuestas: totalRespuestas,
            asistencias: {
              total: totalAsistencias,
              presentes: asistenciasPresentes,
              porcentaje:
                totalAsistencias > 0
                  ? ((asistenciasPresentes / totalAsistencias) * 100).toFixed(2)
                  : '0',
            },
          };
        });

        return sendSuccess(res, progreso, 200, 'Progreso de alumnos obtenido');
      }

      // Dashboard consolidado
      const dashboardData = await Promise.all([
        db.usuario.count(),
        db.bloque.count(),
        db.modulo.count(),
        db.alumnoPerfil.count(),
        db.respuesta.findMany({ take: 10, orderBy: { createdAt: 'desc' } }),
      ]);

      const [usuariosCount, bloquesCount, modulosCount, alumnosCount, ultimasRespuestas] =
        dashboardData;

      return sendSuccess(
        res,
        {
          usuarios: usuariosCount,
          bloques: bloquesCount,
          modulos: modulosCount,
          alumnos: alumnosCount,
          ultimasRespuestas,
        },
        200,
        'Dashboard obtenido'
      );
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (error) {
    return handleError(res, error);
  }
});
