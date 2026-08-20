import type { ServerResponse } from 'http';
import { db } from '../../_lib/db';
import { sendSuccess, sendError, handleError, validateMethod } from '../../_lib/response';
import { withAuth, logAudit } from '../../_lib/auth';
import { requireRole } from '../../_lib/roles';
import { AuthenticatedRequest, ErrorMessages } from '../../_lib/types';

export default withAuth(async (req: AuthenticatedRequest, res: ServerResponse) => {
  try {
    if (req.method === 'GET') {
      return handleGetNoticias(req, res);
    } else if (req.method === 'POST') {
      return handleCreateNoticia(req, res);
    } else {
      return sendError(res, 405, 'Método no permitido');
    }
  } catch (error) {
    return handleError(res, error);
  }
});

/**
 * GET /api/marketing/noticias
 * Obtiene todas las noticias (público)
 */
async function handleGetNoticias(
  req: AuthenticatedRequest,
  res: ServerResponse,
) {
  try {
    const noticias = await db.noticia.findMany({
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
        fecha: 'desc',
      },
    });

    return sendSuccess(res, noticias, 200, 'Noticias obtenidas exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}

/**
 * POST /api/marketing/noticias
 * Crea una nueva noticia (requiere rol marketing o administrador)
 */
async function handleCreateNoticia(
  req: AuthenticatedRequest,
  res: ServerResponse,
) {
  try {
    // Validar rol
    requireRole('marketing', 'administrador')(req.user);

    // Validar campos requeridos
    const { titulo, cuerpo, imagen } = req.body;
    if (!titulo || !cuerpo) {
      return sendError(res, 400, ErrorMessages.MISSING_REQUIRED_FIELDS);
    }

    // Crear noticia
    const noticia = await db.noticia.create({
      data: {
        autorId: req.user!.id,
        titulo: titulo.trim(),
        cuerpo: cuerpo.trim(),
        imagen: imagen?.trim() || null,
        fecha: new Date(),
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
    await logAudit(req.user!.id, 'CREAR', 'NOTICIA', {
      noticiaId: noticia.id,
      titulo: noticia.titulo,
    });

    return sendSuccess(res, noticia, 201, 'Noticia creada exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}
