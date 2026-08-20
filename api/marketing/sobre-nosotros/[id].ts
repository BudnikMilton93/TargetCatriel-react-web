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
      return sendError(res, 400, 'ID inválido');
    }

    if (req.method === 'GET') {
      return handleGetItem(req, res, id);
    } else if (req.method === 'PUT') {
      return handleUpdateItem(req, res, id);
    } else if (req.method === 'DELETE') {
      return handleDeleteItem(req, res, id);
    } else {
      return sendError(res, 405, 'Método no permitido');
    }
  } catch (error) {
    return handleError(res, error);
  }
});

async function handleGetItem(
  req: AuthenticatedRequest,
  res: ServerResponse,
  id: string,
) {
  try {
    const item = await db.sobreNosotros.findUnique({
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

    if (!item) {
      return sendError(res, 404, ErrorMessages.NOT_FOUND);
    }

    return sendSuccess(res, item, 200);
  } catch (error) {
    return handleError(res, error);
  }
}

async function handleUpdateItem(
  req: AuthenticatedRequest,
  res: ServerResponse,
  id: string,
) {
  try {
    requireRole('marketing', 'administrador')(req.user);

    const item = await db.sobreNosotros.findUnique({
      where: { id },
    });

    if (!item) {
      return sendError(res, 404, ErrorMessages.NOT_FOUND);
    }

    const esAdmin = req.user!.roles.includes('administrador');
    if (!esAdmin && item.autorId !== req.user!.id) {
      return sendError(res, 403, ErrorMessages.FORBIDDEN);
    }

    const { contenido, imagen } = req.body;

    const itemActualizado = await db.sobreNosotros.update({
      where: { id },
      data: {
        contenido: contenido?.trim() || item.contenido,
        imagen: imagen !== undefined ? imagen?.trim() || null : item.imagen,
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

    await logAudit(req.user!.id, 'ACTUALIZAR', 'SOBRE_NOSOTROS', {
      sobreNosotrosId: id,
    });

    return sendSuccess(res, itemActualizado, 200, 'Contenido actualizado exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}

async function handleDeleteItem(
  req: AuthenticatedRequest,
  res: ServerResponse,
  id: string,
) {
  try {
    requireRole('marketing', 'administrador')(req.user);

    const item = await db.sobreNosotros.findUnique({
      where: { id },
    });

    if (!item) {
      return sendError(res, 404, ErrorMessages.NOT_FOUND);
    }

    const esAdmin = req.user!.roles.includes('administrador');
    if (!esAdmin && item.autorId !== req.user!.id) {
      return sendError(res, 403, ErrorMessages.FORBIDDEN);
    }

    await db.sobreNosotros.delete({
      where: { id },
    });

    await logAudit(req.user!.id, 'ELIMINAR', 'SOBRE_NOSOTROS', {
      sobreNosotrosId: id,
    });

    return sendSuccess(res, { id }, 200, 'Contenido eliminado exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}
