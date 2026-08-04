// Servicio para llamadas a API backend
// En desarrollo: mock de datos
// En producción: llamadas a Vercel Functions

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

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
  getByProfesor: async (profesorId) => {
    // TODO: GET /api/bloques?profesor_id=:id
    return [];
  },
  create: async (bloque) => {
    // TODO: POST /api/bloques
    return bloque;
  },
  getById: async (id) => {
    // TODO: GET /api/bloques/:id
    return {};
  },
  update: async (id, bloque) => {
    // TODO: PUT /api/bloques/:id
    return bloque;
  },
};

// Módulos
export const modulosService = {
  getByBloque: async (bloqueId) => {
    // TODO: GET /api/modulos?bloque_id=:id
    return [];
  },
  create: async (modulo) => {
    // TODO: POST /api/modulos
    return modulo;
  },
  update: async (id, modulo) => {
    // TODO: PUT /api/modulos/:id
    return modulo;
  },
  delete: async (id) => {
    // TODO: DELETE /api/modulos/:id
    return { id };
  },
};

// Contenidos
export const contenidosService = {
  getByModulo: async (moduloId) => {
    // TODO: GET /api/contenidos?modulo_id=:id
    return [];
  },
  create: async (contenido) => {
    // TODO: POST /api/contenidos
    return contenido;
  },
  update: async (id, contenido) => {
    // TODO: PUT /api/contenidos/:id
    return contenido;
  },
};

// Respuestas (Alumno)
export const respuestasService = {
  getByAlumno: async (alumnoId) => {
    // TODO: GET /api/respuestas?alumno_id=:id
    return [];
  },
  create: async (respuesta) => {
    // TODO: POST /api/respuestas
    return respuesta;
  },
  update: async (id, respuesta) => {
    // TODO: PUT /api/respuestas/:id
    return respuesta;
  },
};

// Asistencias
export const asistenciasService = {
  getByModulo: async (moduloId) => {
    // TODO: GET /api/asistencias?modulo_id=:id
    return [];
  },
  registrar: async (asistencia) => {
    // TODO: POST /api/asistencias
    return asistencia;
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
