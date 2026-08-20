import type { ServerResponse } from 'http';
import { db } from '../../_lib/db';
import { sendSuccess, sendError, handleError } from '../../_lib/response';
import { withAuth, logAudit } from '../../_lib/auth';
import { requireRole } from '../../_lib/roles';
import { AuthenticatedRequest, ErrorMessages } from '../../_lib/types';

export default withAuth(async (req: AuthenticatedRequest, res: ServerResponse) => {
  try {
    if (req.method === 'GET') {
      return handleGetViajes(req, res);
    } else if (req.method === 'POST') {
      return handleCreateViaje(req, res);
    } else {
      return sendError(res, 405, 'Método no permitido');
    }
  } catch (error) {
    return handleError(res, error);
  }
});

/**
 * GET /api/marketing/viajes
 * Obtiene todos los viajes
 */
async function handleGetViajes(
  req: AuthenticatedRequest,
  res: ServerResponse,
) {
  try {
    const viajes = await db.viaje.findMany({
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: {
        fechaInicio: 'asc',
      },
    });

    return sendSuccess(res, viajes, 200, 'Viajes obtenidos exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}

/**
 * POST /api/marketing/viajes
 * Crea un nuevo viaje
 */
async function handleCreateViaje(
  req: AuthenticatedRequest,
  res: ServerResponse,
) {
  try {
    // Validar rol
    requireRole('marketing', 'administrador')(req.user);

    // Validar campos requeridos
    const { destino, fechaInicio, fechaFin, nivelRecomendado, precio, cupos, incluyeClases } = req.body;
    
    if (!destino || !fechaInicio || !fechaFin || !precio || !cupos) {
      return sendError(res, 400, ErrorMessages.MISSING_REQUIRED_FIELDS);
    }

    // Crear viaje
    const viaje = await db.viaje.create({
      data: {
        autorId: req.user!.id,
        destino: destino.trim(),
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        nivelRecomendado: nivelRecomendado || 'A1',
        precio: parseFloat(precio),
        cupos: parseInt(cupos),
        incluyeClases: incluyeClases || false,
      },
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    // Log de auditoría
    await logAudit(req.user!.id, 'CREAR', 'VIAJE', {
      viajeId: viaje.id,
      destino: viaje.destino,
    });

    return sendSuccess(res, viaje, 201, 'Viaje creado exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}
