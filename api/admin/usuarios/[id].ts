import type { ServerResponse } from 'http';
import { db } from '../../_lib/db';
import { sendSuccess, sendError, handleError } from '../../_lib/response';
import { withAuth, logAudit } from '../../_lib/auth';
import { requireRole } from '../../_lib/roles';
import { AuthenticatedRequest } from '../../_lib/types';

export default withAuth(async (req: AuthenticatedRequest, res: ServerResponse) => {
  try {
    const { id } = req.query;

    requireRole('administrador')(req.user);

    if (!id || typeof id !== 'string') {
      return sendError(res, 400, 'ID de usuario requerido');
    }

    if (req.method === 'GET') {
      const usuarioDetail = await db.usuario.findUnique({
        where: { id },
        select: {
          id: true,
          nombre: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          roles: {
            include: { rol: { select: { id: true, nombre: true } } },
          },
          alumniPerfil: true,
          bloques: { select: { id: true, nivel: true } },
        },
      });

      if (!usuarioDetail) {
        return sendError(res, 404, 'Usuario no encontrado');
      }

      return sendSuccess(res, usuarioDetail, 200, 'Usuario obtenido exitosamente');
    }

    if (req.method === 'PUT') {
      const { nombre, email, roleIds } = req.body;

      const usuarioActualizado = await db.usuario.update({
        where: { id },
        data: {
          ...(nombre && { nombre }),
          ...(email && { email }),
          ...(roleIds && {
            roles: {
              deleteMany: {},
              create: roleIds.map((roleId: string) => ({
                rol: { connect: { id: roleId } },
              })),
            },
          }),
        },
        include: {
          roles: { include: { rol: { select: { id: true, nombre: true } } } },
        },
      });

      await logAudit(req.user!.id, 'ACTUALIZAR', 'USUARIO', { usuarioId: id });

      return sendSuccess(res, usuarioActualizado, 200, 'Usuario actualizado exitosamente');
    }

    if (req.method === 'DELETE') {
      if (id === req.user!.id) {
        return sendError(res, 400, 'No puedes eliminar tu propio usuario');
      }

      await db.usuario.delete({
        where: { id },
      });

      await logAudit(req.user!.id, 'ELIMINAR', 'USUARIO', { usuarioId: id });

      return sendSuccess(res, { id }, 200, 'Usuario eliminado exitosamente');
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (error) {
    return handleError(res, error);
  }
});
