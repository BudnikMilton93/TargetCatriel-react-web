// Servicio para llamadas a API backend
// En desarrollo: mock de datos
// En producción: llamadas a Vercel Functions

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Obtiene el token de autenticación del localStorage
 */
function getAuthToken() {
  const session = localStorage.getItem('targetSession');
  if (session) {
    try {
      const userData = JSON.parse(session);
      return userData.id; // El token es el ID del usuario
    } catch (error) {
      console.error('Error parsing session:', error);
      return null;
    }
  }
  return null;
}

/**
 * Wrapper para fetch que agrega headers de autenticación automáticamente
 */
async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}

async function throwApiError(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);
  throw new Error(payload?.error || payload?.message || fallbackMessage);
}

// Noticias
export const noticiasService = {
  getAll: async () => {
    // TODO: Conectar a /api/noticias
    return [];
  },
  create: async (noticia) => {
    // TODO: POST /api/noticias
    return noticia;
  },
  update: async (id, noticia) => {
    // TODO: PUT /api/noticias/:id
    return noticia;
  },
  delete: async (id) => {
    // TODO: DELETE /api/noticias/:id
    return { id };
  },
};

// Viajes
export const viajesService = {
  getAll: async () => {
    // TODO: Conectar a /api/viajes
    return [];
  },
  create: async (viaje) => {
    // TODO: POST /api/viajes
    return viaje;
  },
  update: async (id, viaje) => {
    // TODO: PUT /api/viajes/:id
    return viaje;
  },
  delete: async (id) => {
    // TODO: DELETE /api/viajes/:id
    return { id };
  },
};

// Bloques (Profesor)
export const bloquesService = {
  getAll: async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/bloques`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Error obteniendo bloques');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error en bloquesService.getAll:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/bloques/${id}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Error obteniendo bloque');
      const data = await response.json();
      return data.data || {};
    } catch (error) {
      console.error('Error en bloquesService.getById:', error);
      return null;
    }
  },

  create: async (bloque) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/bloques`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bloque),
      });
      if (!response.ok) throw new Error('Error creando bloque');
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error en bloquesService.create:', error);
      throw error;
    }
  },

  update: async (id, bloque) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/bloques/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bloque),
      });
      if (!response.ok) await throwApiError(response, 'Error actualizando bloque');
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error en bloquesService.update:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/bloques/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) await throwApiError(response, 'Error eliminando bloque');
      const data = await response.json();
      return data.data || { id };
    } catch (error) {
      console.error('Error en bloquesService.delete:', error);
      throw error;
    }
  },
};

// Alumnos por Bloque (Profesor)
export const alumnosService = {
  getByBloque: async (bloqueId) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/bloques/alumnos?bloqueId=${bloqueId}`, {
        method: 'GET',
      });
      if (!response.ok) await throwApiError(response, 'Error obteniendo alumnos');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error en alumnosService.getByBloque:', error);
      throw error;
    }
  },

  buscarCandidatos: async (bloqueId, query) => {
    try {
      const q = encodeURIComponent(query || '');
      const response = await fetchWithAuth(
        `${API_BASE}/profesor/alumnos?bloqueId=${bloqueId}&q=${q}`,
        {
          method: 'GET',
        }
      );
      if (!response.ok) await throwApiError(response, 'Error buscando alumnos');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error en alumnosService.buscarCandidatos:', error);
      throw error;
    }
  },

  invitar: async (bloqueId, alumnoId) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/bloques/alumnos?bloqueId=${bloqueId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alumnoId }),
      });
      if (!response.ok) await throwApiError(response, 'Error invitando alumno');
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error en alumnosService.invitar:', error);
      throw error;
    }
  },

  remover: async (bloqueId, alumnoId) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE}/profesor/bloques/alumnos?bloqueId=${bloqueId}&alumnoId=${alumnoId}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) await throwApiError(response, 'Error removiendo alumno');
      const data = await response.json();
      return data.data || { bloqueId, alumnoId };
    } catch (error) {
      console.error('Error en alumnosService.remover:', error);
      throw error;
    }
  },
};

// Módulos
export const modulosService = {
  getByBloque: async (bloqueId) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/modulos?bloqueId=${bloqueId}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Error obteniendo módulos');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error en modulosService.getByBloque:', error);
      return [];
    }
  },
  create: async (modulo) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/modulos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modulo),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Error creando módulo');
      }

      return payload?.data || null;
    } catch (error) {
      console.error('Error en modulosService.create:', error);
      throw error;
    }
  },
  update: async (id, modulo) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/modulos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modulo),
      });
      if (!response.ok) await throwApiError(response, 'Error actualizando módulo');
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error en modulosService.update:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/modulos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) await throwApiError(response, 'Error eliminando módulo');
      const data = await response.json();
      return data.data || { id };
    } catch (error) {
      console.error('Error en modulosService.delete:', error);
      throw error;
    }
  },
};

// Contenidos
export const contenidosService = {
  getByModulo: async (moduloId) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/contenidos?moduloId=${moduloId}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Error obteniendo contenidos');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error en contenidosService.getByModulo:', error);
      return [];
    }
  },
  create: async (contenido) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/contenidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contenido),
      });
      if (!response.ok) throw new Error('Error creando contenido');
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error en contenidosService.create:', error);
      throw error;
    }
  },
  update: async (id, contenido) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/contenidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contenido),
      });
      if (!response.ok) await throwApiError(response, 'Error actualizando contenido');
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error en contenidosService.update:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/contenidos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) await throwApiError(response, 'Error eliminando contenido');
      const data = await response.json();
      return data.data || { id };
    } catch (error) {
      console.error('Error en contenidosService.delete:', error);
      throw error;
    }
  },
};

// Alumno - Bloques e información del curso
export const alumnoBloquesService = {
  getAll: async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/alumno/bloques`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Error obteniendo tus bloques');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error en alumnoBloquesService.getAll:', error);
      return [];
    }
  },
};

// Módulos del Alumno
export const alumnoModulosService = {
  getByBloque: async (bloqueId) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/alumno/modulos?bloqueId=${bloqueId}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Error obteniendo módulos del bloque');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error en alumnoModulosService.getByBloque:', error);
      return [];
    }
  },
};

// Respuestas del Alumno
export const alumnoRespuestasService = {
  getAll: async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/alumno/respuestas`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Error obteniendo tus respuestas');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error en alumnoRespuestasService.getAll:', error);
      return [];
    }
  },

  getSharedByBloque: async (bloqueId) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/alumno/respuestas?shared=true&bloqueId=${bloqueId}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Error obteniendo respuestas compartidas');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error en alumnoRespuestasService.getSharedByBloque:', error);
      return [];
    }
  },

  create: async ({ contenidoId, respuesta, visibilidad = 'privado' }) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/alumno/respuestas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenidoId, respuesta, visibilidad }),
      });
      if (!response.ok) await throwApiError(response, 'Error enviando respuesta');
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error en alumnoRespuestasService.create:', error);
      throw error;
    }
  },

  update: async (respuestaId, { respuestaActualizada, visibilidad = 'privado' }) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/alumno/respuestas/${respuestaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuestaActualizada, visibilidad }),
      });
      if (!response.ok) await throwApiError(response, 'Error actualizando respuesta');
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error en alumnoRespuestasService.update:', error);
      throw error;
    }
  },

  delete: async (respuestaId) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/alumno/respuestas/${respuestaId}`, {
        method: 'DELETE',
      });
      if (!response.ok) await throwApiError(response, 'Error eliminando respuesta');
      const data = await response.json();
      return data.data || { id: respuestaId };
    } catch (error) {
      console.error('Error en alumnoRespuestasService.delete:', error);
      throw error;
    }
  },
};

// Asistencias del Alumno
export const alumnoAsistenciasService = {
  getAll: async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/alumno/asistencias`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Error obteniendo asistencias');
      const data = await response.json();
      return data.data || { asistencias: [], estadisticas: {} };
    } catch (error) {
      console.error('Error en alumnoAsistenciasService.getAll:', error);
      return { asistencias: [], estadisticas: {} };
    }
  },
};

// Respuestas (Profesor - ver respuestas de sus alumnos)
export const respuestasService = {
  getByProfesor: async () => {
    try {
      // Endpoint para obtener respuestas filtradas por bloques del profesor
      const response = await fetchWithAuth(`${API_BASE}/profesor/respuestas`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Error obteniendo respuestas');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error en respuestasService.getByProfesor:', error);
      return [];
    }
  },

  getByBloque: async (bloqueId) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/respuestas?bloqueId=${bloqueId}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Error obteniendo respuestas');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error en respuestasService.getByBloque:', error);
      return [];
    }
  },
};

// Asistencias (Profesor - ver asistencias de sus alumnos)
export const asistenciasService = {
  getByProfesor: async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/asistencias`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Error obteniendo asistencias');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error en asistenciasService.getByProfesor:', error);
      return [];
    }
  },
  
  getByBloque: async (bloqueId) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/profesor/asistencias?bloqueId=${bloqueId}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Error obteniendo asistencias');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error en asistenciasService.getByBloque:', error);
      return [];
    }
  },
};

// Usuarios (Admin)
export const usuariosService = {
  getAll: async () => {
    // TODO: GET /api/usuarios
    return [];
  },
  getById: async (id) => {
    // TODO: GET /api/usuarios/:id
    return {};
  },
  getRoles: async (usuarioId) => {
    // TODO: GET /api/usuarios/:id/roles
    return [];
  },
  asignarRol: async (usuarioId, rolId) => {
    // TODO: POST /api/usuarios/:id/roles/:rolId
    return {};
  },
};
