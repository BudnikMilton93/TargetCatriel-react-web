import type { ServerResponse } from 'http';
import { db } from '../../_lib/db';
import { sendSuccess, sendError, handleError, validateMethod } from '../../_lib/response';
import { withAuth, logAudit } from '../../_lib/auth';
import { requireRole } from '../../_lib/auth';
import { AuthenticatedRequest, ErrorMessages } from '../../_lib/types';

export default withAuth(async (req: AuthenticatedRequest, res: ServerResponse) => {
  try {
    const method = req.method?.toUpperCase();

    if (method === 'GET') {
      return handleGetBloques(req, res);
    } else if (method === 'POST') {
      return handleCreateBloque(req, res);
    } else {
      return sendError(res, 405, 'Método no permitido');
    }
  } catch (error) {
    return handleError(res, error);
  }
});

/**
 * GET /api/profesor/bloques
 * Listar bloques del profesor
 */
async function handleGetBloques(req: AuthenticatedRequest, res: ServerResponse,) {
  try {
    // Validar rol
    requireRole('profesor', 'administrador')(req.user);

    const bloques = await db.bloque.findMany({
      where: {
        profesorId: req.user!.id,
      },
      include: {
        profesor: {
          select: { id: true, nombre: true, email: true },
        },
        alumnos: {
          include: {
            alumno: {
              select: { usuarioId: true, usuario: { select: { nombre: true, email: true } } },
            },
          },
        },
        modulos: {
          select: { id: true, estado: true, fecha: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, bloques, 200, 'Bloques obtenidos exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}

/**
 * POST /api/profesor/bloques
 * Crear nuevo bloque
 */
async function handleCreateBloque(req: AuthenticatedRequest, res: ServerResponse,) {
  try {
    // Validar rol
    requireRole('profesor', 'administrador')(req.user);

    const { nivel, dias, horaInicio, horaFin, anio } = req.body;

    if (!nivel || !dias || !horaInicio || !horaFin || !anio) {
      return sendError(res, 400, 'Faltan campos requeridos: nivel, dias, horaInicio, horaFin, anio');
    }

    const bloque = await db.bloque.create({
      data: {
        profesorId: req.user!.id,
        nivel,
        dias,
        horaInicio: new Date(horaInicio),
        horaFin: new Date(horaFin),
        anio,
      },
      include: {
        profesor: { select: { id: true, nombre: true, email: true } },
      },
    });

    await logAudit(req.user!.id, 'CREAR', 'BLOQUE', { bloqueId: bloque.id });

    return sendSuccess(res, bloque, 201, 'Bloque creado exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}
