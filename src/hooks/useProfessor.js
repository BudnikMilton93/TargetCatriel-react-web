import { useState, useCallback } from 'react';
import { bloquesService, alumnosService, modulosService, contenidosService } from '../services/api';

/**
 * Hook para manejar lógica común del profesor
 */
export function useProfessor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Funciones para manejar bloques, módulos y contenidos
  const crearBloque = useCallback(async (datosBloque) => {
    try {
      setLoading(true);
      setError(null);
      const nuevoBloque = await bloquesService.create(datosBloque);
      return nuevoBloque;
    } catch (err) {
      const mensaje = err.message || 'Error creando bloque';
      setError(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar un bloque
  const actualizarBloque = useCallback(async (id, datosBloque) => {
    try {
      setLoading(true);
      setError(null);
      const bloqueActualizado = await bloquesService.update(id, datosBloque);
      return bloqueActualizado;
    } catch (err) {
      const mensaje = err.message || 'Error actualizando bloque';
      setError(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para eliminar un bloque
  const eliminarBloque = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await bloquesService.delete(id);
    } catch (err) {
      const mensaje = err.message || 'Error eliminando bloque';
      setError(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Funciones para manejar módulos
  const crearModulo = useCallback(async (datosModulo) => {
    try {
      setLoading(true);
      setError(null);
      const nuevoModulo = await modulosService.create(datosModulo);
      return nuevoModulo;
    } catch (err) {
      const mensaje = err.message || 'Error creando módulo';
      setError(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar un módulo
  const actualizarModulo = useCallback(async (id, datosModulo) => {
    try {
      setLoading(true);
      setError(null);
      const moduloActualizado = await modulosService.update(id, datosModulo);
      return moduloActualizado;
    } catch (err) {
      const mensaje = err.message || 'Error actualizando módulo';
      setError(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para eliminar un módulo
  const eliminarModulo = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await modulosService.delete(id);
    } catch (err) {
      const mensaje = err.message || 'Error eliminando módulo';
      setError(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para crear contenido (actividad, pregunta, texto, audio)
  const crearContenido = useCallback(async (datosContenido) => {
    try {
      setLoading(true);
      setError(null);
      const nuevoContenido = await contenidosService.create(datosContenido);
      return nuevoContenido;
    } catch (err) {
      const mensaje = err.message || 'Error creando actividad';
      setError(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar contenido
  const actualizarContenido = useCallback(async (id, datosContenido) => {
    try {
      setLoading(true);
      setError(null);
      const contenidoActualizado = await contenidosService.update(id, datosContenido);
      return contenidoActualizado;
    } catch (err) {
      const mensaje = err.message || 'Error actualizando actividad';
      setError(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para eliminar contenido
  const eliminarContenido = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await contenidosService.delete(id);
    } catch (err) {
      const mensaje = err.message || 'Error eliminando actividad';
      setError(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para invitar a un alumno a un bloque
  const invitarAlumno = useCallback(async (bloqueId, alumnoId) => {
    try {
      setLoading(true);
      setError(null);
      const resultado = await alumnosService.invitar(bloqueId, alumnoId);
      return resultado;
    } catch (err) {
      const mensaje = err.message || 'Error invitando alumno';
      setError(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para remover a un alumno de un bloque
  const removerAlumno = useCallback(async (bloqueId, alumnoId) => {
    try {
      setLoading(true);
      setError(null);
      await alumnosService.remover(bloqueId, alumnoId);
    } catch (err) {
      const mensaje = err.message || 'Error removiendo alumno';
      setError(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Función para limpiar el error
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    crearBloque,
    actualizarBloque,
    eliminarBloque,
    crearModulo,
    actualizarModulo,
    eliminarModulo,
    crearContenido,
    actualizarContenido,
    eliminarContenido,
    invitarAlumno,
    removerAlumno,
    limpiarError,
  };
}
