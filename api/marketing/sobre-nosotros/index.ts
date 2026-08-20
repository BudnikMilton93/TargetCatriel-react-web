import type { ServerResponse } from 'http';
import { db } from '../../_lib/db';
import { sendSuccess, sendError, handleError } from '../../_lib/response';
import { withAuth, logAudit } from '../../_lib/auth';
import { requireRole } from '../../_lib/roles';
import { AuthenticatedRequest, ErrorMessages } from '../../_lib/types';

export default withAuth(async (req: AuthenticatedRequest, res: ServerResponse) => {
  try {
    if (req.method === 'GET') {
      return handleGetSobreNosotros(req, res);
    } else if (req.method === 'POST') {
      return handleCreateSobreNosotros(req, res);
    } else {
      return sendError(res, 405, 'Método no permitido');
    }
  } catch (error) {
    return handleError(res, error);
  }
});

/**
 * GET /api/marketing/sobre-nosotros
 */
async function handleGetSobreNosotros(
  req: AuthenticatedRequest,
  res: ServerResponse,
) {
  try {
    const sobreNosotros = await db.sobreNosotros.findMany({
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

    return sendSuccess(res, sobreNosotros, 200, 'Contenido obtenido exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}

/**
 * POST /api/marketing/sobre-nosotros
 */
async function handleCreateSobreNosotros(
  req: AuthenticatedRequest,
  res: ServerResponse,
) {
  try {
    requireRole('marketing', 'administrador')(req.user);

    const { contenido, imagen } = req.body;
    
    if (!contenido) {
      return sendError(res, 400, ErrorMessages.MISSING_REQUIRED_FIELDS);
    }

    const item = await db.sobreNosotros.create({
      data: {
        autorId: req.user!.id,
        contenido: contenido.trim(),
        imagen: imagen?.trim() || null,
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

    await logAudit(req.user!.id, 'CREAR', 'SOBRE_NOSOTROS', {
      sobreNosotrosId: item.id,
    });

    return sendSuccess(res, item, 201, 'Contenido creado exitosamente');
  } catch (error) {
    return handleError(res, error);
  }
}
