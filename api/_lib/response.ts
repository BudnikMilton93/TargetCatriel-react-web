import type { ServerResponse } from 'http';
import { ApiResponseBody, ApiError, ErrorMessages } from './types';

/**
 * Respuesta exitosa
 */
export function sendSuccess<T>(
  res: ServerResponse,
  data: T,
  statusCode: number = 200,
  message?: string,
): ServerResponse {
  const response: ApiResponseBody<T> = {
    success: true,
    data,
    message,
  };
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(response));
  return res;
}

/**
 * Respuesta de error
 */
export function sendError(
  res: ServerResponse,
  statusCode: number,
  message: string,
  error?: any,
): ServerResponse {
  console.error(`[ERROR ${statusCode}]`, message, error);
  const response: ApiResponseBody = {
    success: false,
    error: message,
  };
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(response));
  return res;
}

/**
 * Maneja errores y envía respuesta apropiada
 */
export function handleError(res: ServerResponse, error: any): ServerResponse {
  if (error instanceof ApiError) {
    return sendError(res, error.statusCode, error.message);
  }

  if (error instanceof Error) {
    console.error('Unhandled error:', error);
    return sendError(res, 500, ErrorMessages.INTERNAL_ERROR, error.message);
  }

  console.error('Unknown error:', error);
  return sendError(res, 500, ErrorMessages.INTERNAL_ERROR);
}

/**
 * Wrapper para handlers con manejo de errores automático
 */
export function apiHandler(
  handler: (req: any, res: ServerResponse) => Promise<any>,
) {
  return async (req: any, res: ServerResponse) => {
    try {
      return await handler(req, res);
    } catch (error) {
      return handleError(res, error);
    }
  };
}

/**
 * Valida que el método HTTP sea el permitido
 */
export function validateMethod(
  req: any,
  allowedMethods: string[],
): boolean {
  return allowedMethods.includes(req.method);
}

/**
 * Respuesta de método no permitido
 */
export function sendMethodNotAllowed(res: ServerResponse): ServerResponse {
  return sendError(res, 405, 'Método HTTP no permitido');
}
