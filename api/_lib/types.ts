import type { IncomingMessage } from 'http';
import type { ServerResponse } from 'http';

// Request estándar con propiedades extendidas
export interface ApiRequest extends IncomingMessage {
  query?: Record<string, string | string[]>;
  body?: any;
}

// Response estándar
export type ApiResponse = ServerResponse;

// Tipos de respuesta API
export interface ApiResponseBody<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Usuario con contexto autenticado
export interface AuthenticatedUser {
  id: string;
  nombre: string;
  email: string;
  roles: string[];
}

// Request extendido con usuario
export interface AuthenticatedRequest extends ApiRequest {
  user?: AuthenticatedUser;
}

// Tipos de roles
export type UserRole = 'administrador' | 'profesor' | 'alumno' | 'marketing';

// Errores estándar
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
  ) {
    super(message);
  }
}

export const ErrorMessages = {
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
  NOT_FOUND: 'No encontrado',
  INVALID_REQUEST: 'Solicitud inválida',
  INTERNAL_ERROR: 'Error interno del servidor',
  INVALID_ROLE: 'Rol inválido',
  MISSING_REQUIRED_FIELDS: 'Faltan campos requeridos',
};
