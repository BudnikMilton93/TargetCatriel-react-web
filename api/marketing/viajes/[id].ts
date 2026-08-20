import type { ServerResponse } from 'http';
import { db } from '../../_lib/db';
import { sendSuccess, sendError, handleError } from '../../_lib/response';
import { withAuth, logAudit } from '../../_lib/auth';
import { requireRole } from '../../_lib/roles';
import { AuthenticatedRequest, ErrorMessages } from '../../_lib/types';

export default withAuth(async (req: AuthenticatedRequest, res: ServerResponse) => {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return sendError(res, 400, 'ID de viaje inválido');
    }

    if (req.method === 'GET') {
      return handleGetViaje(req, res, id);
    } else if (req.method === 'PUT') {
      return handleUpdateViaje(req, res, id);
    } else if (req.method === 'DELETE') {
      return handleDeleteViaje(req, res, id);
    } else {
      return sendError(res, 405, 'Método no permitido');
    }
  } catch (error) {
    return handleError(res, error);
  }
});

/**
 * GET /api/marketing/viajes/[id]
 */
async function handleGetViaje(
  req: AuthenticatedRequest,
  res: ServerResponse,
  id: string,
) {
  try {
    const viaje = await db.viaje.findUnique({
      where: { id },
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

    if (!viaje) {
      return sendError(res, 404, ErrorMessages.NOT_FOUND);
    }

    return sendSuccess(res, viaje, 200, 'Viaje obtenido exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}

/**
 * PUT /api/marketing/viajes/[id]
 */
async function handleUpdateViaje(
  req: AuthenticatedRequest,
  res: ServerResponse,
  id: string,
) {
  try {
    requireRole('marketing', 'administrador')(req.user);

    const viaje = await db.viaje.findUnique({
      where: { id },
    });

    if (!viaje) {
      return sendError(res, 404, ErrorMessages.NOT_FOUND);
    }

    const esAdmin = req.user!.roles.includes('administrador');
    if (!esAdmin && viaje.autorId !== req.user!.id) {
      return sendError(res, 403, ErrorMessages.FORBIDDEN);
    }

    const { destino, fechaInicio, fechaFin, nivelRecomendado, precio, cupos, incluyeClases } = req.body;
    
    const viajeActualizado = await db.viaje.update({
      where: { id },
      data: {
        destino: destino?.trim() || viaje.destino,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : viaje.fechaInicio,
        fechaFin: fechaFin ? new Date(fechaFin) : viaje.fechaFin,
        nivelRecomendado: nivelRecomendado || viaje.nivelRecomendado,
        precio: precio !== undefined ? parseFloat(precio) : viaje.precio,
        cupos: cupos !== undefined ? parseInt(cupos) : viaje.cupos,
        incluyeClases: incluyeClases !== undefined ? incluyeClases : viaje.incluyeClases,
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

    await logAudit(req.user!.id, 'ACTUALIZAR', 'VIAJE', {
      viajeId: id,
      destino: viajeActualizado.destino,
    });

    return sendSuccess(res, viajeActualizado, 200, 'Viaje actualizado exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}

/**
 * DELETE /api/marketing/viajes/[id]
 */
async function handleDeleteViaje(
  req: AuthenticatedRequest,
  res: ServerResponse,
  id: string,
) {
  try {
    requireRole('marketing', 'administrador')(req.user);

    const viaje = await db.viaje.findUnique({
      where: { id },
    });

    if (!viaje) {
      return sendError(res, 404, ErrorMessages.NOT_FOUND);
    }

    const esAdmin = req.user!.roles.includes('administrador');
    if (!esAdmin && viaje.autorId !== req.user!.id) {
      return sendError(res, 403, ErrorMessages.FORBIDDEN);
    }

    await db.viaje.delete({
      where: { id },
    });

    await logAudit(req.user!.id, 'ELIMINAR', 'VIAJE', {
      viajeId: id,
      destino: viaje.destino,
    });

    return sendSuccess(res, { id }, 200, 'Viaje eliminado exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}
