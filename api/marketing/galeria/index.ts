import type { ServerResponse } from 'http';
import { db } from '../../_lib/db';
import { sendSuccess, sendError, handleError } from '../../_lib/response';
import { withAuth, logAudit } from '../../_lib/auth';
import { requireRole } from '../../_lib/roles';
import { AuthenticatedRequest, ErrorMessages } from '../../_lib/types';

export default withAuth(async (req: AuthenticatedRequest, res: ServerResponse) => {
  try {
    if (req.method === 'GET') {
      return handleGetGaleria(req, res);
    } else if (req.method === 'POST') {
      return handleCreateGaleria(req, res);
    } else {
      return sendError(res, 405, 'Método no permitido');
    }
  } catch (error) {
    return handleError(res, error);
  }
});

/**
 * GET /api/marketing/galeria
 */
async function handleGetGaleria(
  req: AuthenticatedRequest,
  res: ServerResponse,
) {
  try {
    const galeria = await db.galeria.findMany({
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
        orden: 'asc',
      },
    });

    return sendSuccess(res, galeria, 200, 'Galería obtenida exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}

/**
 * POST /api/marketing/galeria
 */
async function handleCreateGaleria(
  req: AuthenticatedRequest,
  res: ServerResponse,
) {
  try {
    requireRole('marketing', 'administrador')(req.user);

    const { tipo, url, orden } = req.body;
    
    if (!tipo || !url) {
      return sendError(res, 400, ErrorMessages.MISSING_REQUIRED_FIELDS);
    }

    if (!['foto', 'video'].includes(tipo)) {
      return sendError(res, 400, 'Tipo inválido. Debe ser "foto" o "video"');
    }

    const item = await db.galeria.create({
      data: {
        autorId: req.user!.id,
        tipo,
        url: url.trim(),
        orden: orden || 0,
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

    await logAudit(req.user!.id, 'CREAR', 'GALERIA', {
      galeriaId: item.id,
      tipo: item.tipo,
    });

    return sendSuccess(res, item, 201, 'Item de galería creado exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}
