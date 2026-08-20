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
      return sendError(res, 400, 'ID de noticia inválido');
    }

    if (req.method === 'GET') {
      return handleGetNoticia(req, res, id);
    } else if (req.method === 'PUT') {
      return handleUpdateNoticia(req, res, id);
    } else if (req.method === 'DELETE') {
      return handleDeleteNoticia(req, res, id);
    } else {
      return sendError(res, 405, 'Método no permitido');
    }
  } catch (error) {
    return handleError(res, error);
  }
});

/**
 * GET /api/marketing/noticias/[id]
 * Obtiene una noticia específica
 */
async function handleGetNoticia(
  req: AuthenticatedRequest,
  res: ServerResponse,
  id: string,
) {
  try {
    const noticia = await db.noticia.findUnique({
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

    if (!noticia) {
      return sendError(res, 404, ErrorMessages.NOT_FOUND);
    }

    return sendSuccess(res, noticia, 200, 'Noticia obtenida exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}

/**
 * PUT /api/marketing/noticias/[id]
 * Actualiza una noticia (solo marketing o admin, y solo si es el autor)
 */
async function handleUpdateNoticia(
  req: AuthenticatedRequest,
  res: ServerResponse,
  id: string,
) {
  try {
    // Validar rol
    requireRole('marketing', 'administrador')(req.user);

    // Obtener noticia existente
    const noticia = await db.noticia.findUnique({
      where: { id },
    });

    if (!noticia) {
      return sendError(res, 404, ErrorMessages.NOT_FOUND);
    }

    // Verificar autorización: solo el autor o admin
    const esAdmin = req.user!.roles.includes('administrador');
    if (!esAdmin && noticia.autorId !== req.user!.id) {
      return sendError(res, 403, ErrorMessages.FORBIDDEN);
    }

    // Actualizar noticia
    const { titulo, cuerpo, imagen } = req.body;
    const noticiaActualizada = await db.noticia.update({
      where: { id },
      data: {
        titulo: titulo?.trim() || noticia.titulo,
        cuerpo: cuerpo?.trim() || noticia.cuerpo,
        imagen: imagen !== undefined ? imagen?.trim() || null : noticia.imagen,
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
    await logAudit(req.user!.id, 'ACTUALIZAR', 'NOTICIA', {
      noticiaId: id,
      titulo: noticiaActualizada.titulo,
    });

    return sendSuccess(res, noticiaActualizada, 200, 'Noticia actualizada exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}

/**
 * DELETE /api/marketing/noticias/[id]
 * Elimina una noticia (solo marketing o admin, y solo si es el autor)
 */
async function handleDeleteNoticia(
  req: AuthenticatedRequest,
  res: ServerResponse,
  id: string,
) {
  try {
    // Validar rol
    requireRole('marketing', 'administrador')(req.user);

    // Obtener noticia existente
    const noticia = await db.noticia.findUnique({
      where: { id },
    });

    if (!noticia) {
      return sendError(res, 404, ErrorMessages.NOT_FOUND);
    }

    // Verificar autorización: solo el autor o admin
    const esAdmin = req.user!.roles.includes('administrador');
    if (!esAdmin && noticia.autorId !== req.user!.id) {
      return sendError(res, 403, ErrorMessages.FORBIDDEN);
    }

    // Eliminar noticia
    await db.noticia.delete({
      where: { id },
    });

    // Log de auditoría
    await logAudit(req.user!.id, 'ELIMINAR', 'NOTICIA', {
      noticiaId: id,
      titulo: noticia.titulo,
    });

    return sendSuccess(res, { id }, 200, 'Noticia eliminada exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}
