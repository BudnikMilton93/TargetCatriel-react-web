import type { ServerResponse } from 'http';
import { db } from '../../_lib/db';
import { sendSuccess, sendError, handleError } from '../../_lib/response';
import { withAuth, logAudit } from '../../_lib/auth';
import { requireRole } from '../../_lib/roles';
import { AuthenticatedRequest, ErrorMessages } from '../../_lib/types';

export default withAuth(async (req: AuthenticatedRequest, res: ServerResponse) => {
  try {
    requireRole('administrador')(req.user);

    if (req.method === 'GET') {
      const usuarios = await db.usuario.findMany({
        select: {
          id: true,
          nombre: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          roles: {
            include: { rol: { select: { id: true, nombre: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, usuarios, 200, 'Usuarios obtenidos exitosamente');
    }

    if (req.method === 'POST') {
      const { nombre, email, passwordHash, roleIds } = req.body;

      if (!nombre || !email || !passwordHash) {
        return sendError(res, 400, 'Nombre, email y contraseña son requeridos');
      }

      const usuarioExistente = await db.usuario.findUnique({
        where: { email },
      });

      if (usuarioExistente) {
        return sendError(res, 409, 'El email ya está registrado');
      }

      const nuevoUsuario = await db.usuario.create({
        data: {
          nombre,
          email,
          passwordHash,
          roles: {
            create: (roleIds || ['cmsg6edci000d8r2upapne4c3']).map((roleId: string) => ({
              rol: { connect: { id: roleId } },
            })),
          },
        },
        include: {
          roles: { include: { rol: { select: { id: true, nombre: true } } } },
        },
      });

      await logAudit(req.user!.id, 'CREAR', 'USUARIO', {
        usuarioId: nuevoUsuario.id,
      });

      return sendSuccess(res, nuevoUsuario, 201, 'Usuario creado exitosamente');
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (error) {
    return handleError(res, error);
  }
});
