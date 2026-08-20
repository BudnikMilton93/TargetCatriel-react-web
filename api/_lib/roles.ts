import { ApiError, ErrorMessages, UserRole, type AuthenticatedUser } from './types';
import { db } from './db';

/**
 * Obtiene los roles de un usuario por ID
 */
export async function getUserRoles(usuarioId: string): Promise<string[]> {
  try {
    const usuarioRoles = await db.usuarioRol.findMany({
      where: { usuarioId },
      include: { rol: true },
    });
    return usuarioRoles.map((ur) => ur.rol.nombre);
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    return [];
  }
}

/**
 * Verifica si un usuario tiene un rol específico
 */
export function hasRole(
  userRoles: string[],
  requiredRole: UserRole | UserRole[],
): boolean {
  const required = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return required.some((role) => userRoles.includes(role));
}

/**
 * Verifica si un usuario tiene TODOS los roles requeridos
 */
export function hasAllRoles(
  userRoles: string[],
  requiredRoles: UserRole[],
): boolean {
  return requiredRoles.every((role) => userRoles.includes(role));
}

/**
 * Middleware para validar que el usuario tiene al menos uno de los roles
 */
export function requireRole(...roles: string[]) {
  return (user: AuthenticatedUser | undefined) => {
    if (!user) {
      throw new ApiError(401, ErrorMessages.UNAUTHORIZED);
    }
    if (!roles.some((role) => user.roles.includes(role))) {
      throw new ApiError(403, ErrorMessages.FORBIDDEN);
    }
  };
}

export function requireRoles(...allowedRoles: UserRole[]) {
  return (userRoles: string[]): boolean => {
    return hasRole(userRoles, allowedRoles);
  };
}

/**
 * Roles permitidos para cada operación
 */
export const ROLE_PERMISSIONS = {
  // Marketing
  'crear_noticia': ['marketing', 'administrador'],
  'editar_noticia': ['marketing', 'administrador'],
  'eliminar_noticia': ['marketing', 'administrador'],
  'ver_noticias': ['administrador', 'marketing', 'profesor', 'alumno'],

  // Viajes
  'crear_viaje': ['marketing', 'administrador'],
  'editar_viaje': ['marketing', 'administrador'],
  'eliminar_viaje': ['marketing', 'administrador'],
  'ver_viajes': ['administrador', 'marketing', 'profesor', 'alumno'],

  // Galería
  'crear_galeria': ['marketing', 'administrador'],
  'editar_galeria': ['marketing', 'administrador'],
  'eliminar_galeria': ['marketing', 'administrador'],
  'ver_galeria': ['administrador', 'marketing', 'profesor', 'alumno'],

  // Profesor - Bloques
  'crear_bloque': ['profesor', 'administrador'],
  'editar_bloque_propio': ['profesor', 'administrador'],
  'eliminar_bloque_propio': ['profesor', 'administrador'],
  'editar_bloque_cualquiera': ['administrador'],
  'ver_bloques_propios': ['profesor'],
  'ver_todos_bloques': ['administrador'],

  // Profesor - Módulos
  'crear_modulo': ['profesor', 'administrador'],
  'editar_modulo_propio': ['profesor', 'administrador'],
  'eliminar_modulo_propio': ['profesor', 'administrador'],
  'ver_modulos_propios': ['profesor', 'administrador'],
  'ver_modulos_asignados': ['alumno'],

  // Alumno - Respuestas
  'crear_respuesta': ['alumno'],
  'editar_respuesta_propia': ['alumno'],
  'ver_respuestas_propias': ['alumno'],
  'ver_respuestas_grupo': ['profesor', 'administrador'],

  // Admin
  'ver_usuarios': ['administrador'],
  'crear_usuario': ['administrador'],
  'editar_usuario': ['administrador'],
  'eliminar_usuario': ['administrador'],
};

/**
 * Verifica si un usuario puede realizar una acción
 */
export function canPerformAction(
  userRoles: string[],
  action: keyof typeof ROLE_PERMISSIONS,
): boolean {
  const allowedRoles = ROLE_PERMISSIONS[action] || [];
  return hasRole(userRoles, allowedRoles as UserRole[]);
}
