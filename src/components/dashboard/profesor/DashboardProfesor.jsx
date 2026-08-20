import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { bloquesService, alumnosService, respuestasService, modulosService } from '../../../services/api';
import { useProfessor } from '../../../hooks/useProfessor';
import BloqueModal from '../../profesor/BloqueModal';
import '../../../styles/pages/dashboard.css';

const TIPOS_CONTENIDO = [
  { value: 'texto', label: 'Texto' },
  { value: 'actividad', label: 'Actividad' },
  { value: 'pregunta', label: 'Pregunta' },
  { value: 'audio', label: 'Audio' },
];

const CONTENIDO_VACIO = { tipo: 'texto', contenido: '', orden: 0 };

const CONTENIDO_META = {
  texto: {
    titulo: 'Texto',
    ayuda: 'Comparte una explicación corta, consigna o referencia para el módulo.',
    placeholder: 'Ejemplo: Hoy veremos el pasado simple con ejemplos de viajes y rutinas.',
    icono: 'doc',
  },
  actividad: {
    titulo: 'Actividad',
    ayuda: 'Define una tarea con pasos claros y el criterio esperado de entrega.',
    placeholder: 'Ejemplo: Completa 5 oraciones usando pasado simple y sube tu respuesta.',
    icono: 'checklist',
  },
  pregunta: {
    titulo: 'Pregunta',
    ayuda: 'Plantea una pregunta puntual para evaluar comprensión o reflexión.',
    placeholder: 'Ejemplo: Cuál es la diferencia entre "did" y "was" en estas oraciones?',
    icono: 'help',
  },
  audio: {
    titulo: 'Audio',
    ayuda: 'Incluye instrucciones de escucha y que debe responder el alumno.',
    placeholder: 'Ejemplo: Escucha el audio y responde 3 ideas principales del diálogo.',
    icono: 'audio',
  },
};

// Función para obtener la fecha de hoy en formato YYYY-MM-DD para inputs de tipo date
function getTodayLocalInputDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Función para formatear fechas en formato local (es-AR) sin la parte de tiempo
function formatDateOnlyUTC(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('es-AR', { timeZone: 'UTC' }).format(date);
}

// Función para formatear días de la semana
function formatDias(dias) {
  if (!dias) return 'Sin días';
  if (Array.isArray(dias)) {
    return dias.join(', ');
  }
  return dias;
}

// Función para formatear horario de inicio y fin
function formatHorario(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return 'Sin horario';

  const inicio = new Date(horaInicio);
  const fin = new Date(horaFin);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    return 'Sin horario';
  }

  return `${inicio.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} - ${fin.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
}

// Componente para renderizar íconos SVG según el nombre proporcionado
function Icon({ name, className = '' }) {
  const commonProps = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };

  switch (name) {
    case 'book':
      return (
        <svg {...commonProps}>
          <path d="M4 6.6c0-1.4 1.2-2.6 2.6-2.6h12.8V20H6.6A2.6 2.6 0 0 1 4 17.4V6.6Z" />
          <path d="M8 4v16" />
        </svg>
      );
    case 'users':
      return (
        <svg {...commonProps}>
          <path d="M16 21v-1.4a3.6 3.6 0 0 0-3.6-3.6H7.6A3.6 3.6 0 0 0 4 19.6V21" />
          <circle cx="10" cy="8" r="3" />
          <path d="M20 21v-1.4a3.4 3.4 0 0 0-2.2-3.2" />
          <path d="M15.8 4.8a3 3 0 0 1 0 5.7" />
        </svg>
      );
    case 'layers':
      return (
        <svg {...commonProps}>
          <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
          <path d="m4 12.5 8 4.5 8-4.5" />
          <path d="m4 17.5 8 4.5 8-4.5" />
        </svg>
      );
    case 'edit':
      return (
        <svg {...commonProps}>
          <path d="M3 17.3V21h3.7L18 9.7l-3.7-3.7L3 17.3Z" />
          <path d="m13.8 6.2 3.7 3.7" />
        </svg>
      );
    case 'trash':
      return (
        <svg {...commonProps}>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 10v7" />
          <path d="M14 10v7" />
        </svg>
      );
    case 'eye':
      return (
        <svg {...commonProps}>
          <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.8" />
        </svg>
      );
    case 'eye-off':
      return (
        <svg {...commonProps}>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6A2.8 2.8 0 0 0 13.4 13.4" />
          <path d="M9 5.3A10.7 10.7 0 0 1 12 5c5.6 0 9 4.2 10 7a13.9 13.9 0 0 1-4 5.1" />
          <path d="M6.6 6.6A13.5 13.5 0 0 0 2 12s3.6 6 10 6a10.8 10.8 0 0 0 4.4-1" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...commonProps}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4" />
          <path d="M8 3v4" />
          <path d="M3 10h18" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'chevron':
      return (
        <svg {...commonProps}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...commonProps}>
          <path d="m12 2 1.8 4.2L18 8l-4.2 1.8L12 14l-1.8-4.2L6 8l4.2-1.8L12 2Z" />
          <path d="m18.5 15 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
          <path d="m5.5 15 .8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8.8-1.7Z" />
        </svg>
      );
    case 'doc':
      return (
        <svg {...commonProps}>
          <path d="M7 3h7l4 4v14H7V3Z" />
          <path d="M14 3v4h4" />
          <path d="M10 12h6" />
          <path d="M10 16h6" />
        </svg>
      );
    case 'checklist':
      return (
        <svg {...commonProps}>
          <path d="M9 6h11" />
          <path d="M9 12h11" />
          <path d="M9 18h11" />
          <path d="m3 6 1.5 1.5L7 5" />
          <path d="m3 12 1.5 1.5L7 11" />
          <path d="m3 18 1.5 1.5L7 17" />
        </svg>
      );
    case 'help':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.6 9.2a2.7 2.7 0 1 1 4.8 1.7c-.7.7-1.4 1-1.8 1.7" />
          <path d="M12 16.7h.01" />
        </svg>
      );
    case 'audio':
      return (
        <svg {...commonProps}>
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          <path d="M15.5 9.5a4 4 0 0 1 0 5" />
          <path d="M18 7a7 7 0 0 1 0 10" />
        </svg>
      );
    case 'close':
      return (
        <svg {...commonProps}>
          <path d="m6 6 12 12" />
          <path d="m18 6-12 12" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...commonProps}>
          <path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
          <path d="M10 17 15 12 10 7" />
          <path d="M15 12H3" />
        </svg>
      );
    case 'arrow-left':
      return (
        <svg {...commonProps}>
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
      );
    default:
      return null;
  }
}

// Componente principal del dashboard del profesor
export default function DashboardProfesor() {
  const { user, logout } = useAuth();
  
  // Custom hook for professor actions
  const {
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
    loading: actionLoading,
  } = useProfessor();

  const [bloques, setBloques] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [selectedBloque, setSelectedBloque] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alumnosCuenta, setAlumnosCuenta] = useState({});
  const [ultimasRespuestas, setUltimasRespuestas] = useState([]);
  const [respuestasBloque, setRespuestasBloque] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [bloqueEnEdicion, setBloqueEnEdicion] = useState(null);
  const [nuevoModulo, setNuevoModulo] = useState({ fecha: getTodayLocalInputDate(), estado: 'oculto' });
  const [moduloExpandidoId, setModuloExpandidoId] = useState(null);
  const [nuevoContenido, setNuevoContenido] = useState(CONTENIDO_VACIO);
  const [contenidoEnEdicion, setContenidoEnEdicion] = useState(null);
  const [activeDetalleTab, setActiveDetalleTab] = useState('modulos');
  const [alumnosBloque, setAlumnosBloque] = useState([]);
  const [alumnosLoading, setAlumnosLoading] = useState(false);
  const [busquedaAlumno, setBusquedaAlumno] = useState('');
  const [candidatosAlumnos, setCandidatosAlumnos] = useState([]);
  const [buscandoCandidatos, setBuscandoCandidatos] = useState(false);
  const [invitandoAlumnoId, setInvitandoAlumnoId] = useState(null);
  const [removiendoAlumnoId, setRemoviendoAlumnoId] = useState(null);
  const [confirmacionAccion, setConfirmacionAccion] = useState(null);
  const [respuestaContenidoId, setRespuestaContenidoId] = useState(null);
  const [contenidoRespuestaExpandidoId, setContenidoRespuestaExpandidoId] = useState(null);
  const [bloqueFeedback, setBloqueFeedback] = useState(null);
  const [moduloFeedback, setModuloFeedback] = useState(null);
  const [contenidoFeedback, setContenidoFeedback] = useState(null);
  const [respuestasVisible, setRespuestasVisible] = useState(true);

  const contenidoMetaActual = CONTENIDO_META[nuevoContenido.tipo] || CONTENIDO_META.texto;

  // Cargar modulos del bloque seleccionado
  const cargarModulosDelBloque = async (bloqueId) => {
    if (!bloqueId) {
      setModulos([]);
      return;
    }

    try {
      const modulosData = await modulosService.getByBloque(bloqueId);
      setModulos(modulosData);
    } catch {
      setModulos([]);
    }
  };

  // Cargar respuestas del bloque seleccionado
  const cargarRespuestasDelBloque = async (bloqueId) => {
    if (!bloqueId) {
      setRespuestasBloque([]);
      return;
    }

    try {
      const respuestas = await respuestasService.getByBloque(bloqueId);
      setRespuestasBloque(respuestas);
    } catch {
      setRespuestasBloque([]);
    }
  };

  // Cargar alumnos del bloque y actualizar el conteo
  const cargarAlumnosDelBloque = async (bloqueId) => {
    if (!bloqueId) {
      setAlumnosBloque([]);
      return [];
    }

    setAlumnosLoading(true);
    try {
      const alumnos = await alumnosService.getByBloque(bloqueId);
      setAlumnosBloque(alumnos);
      setAlumnosCuenta((prev) => ({
        ...prev,
        [bloqueId]: alumnos.length,
      }));
      return alumnos;
    } catch {
      setAlumnosBloque([]);
      return [];
    } finally {
      setAlumnosLoading(false);
    }
  };

  // Calcular métricas de participación por módulo
  const moduloMetricas = useMemo(() => {
    const metricas = {};
    const totalAlumnosBloque = selectedBloque?.id ? (alumnosCuenta[selectedBloque.id] || 0) : 0;

    for (const modulo of modulos) {
      const moduloId = modulo.id;
      const respuestasModulo = respuestasBloque.filter((respuesta) => respuesta?.contenido?.modulo?.id === moduloId);
      const participantesUnicos = new Set(
        respuestasModulo
          .map((respuesta) => respuesta?.alumno?.usuario?.id)
          .filter(Boolean)
      ).size;

      const porcentajeParticipacion = totalAlumnosBloque > 0
        ? Math.min(100, Math.round((participantesUnicos / totalAlumnosBloque) * 100))
        : 0;

      metricas[moduloId] = {
        actividades: modulo.contenidos?.length || 0,
        respuestas: respuestasModulo.length,
        participantesUnicos,
        porcentajeParticipacion,
      };
    }

    return metricas;
  }, [modulos, respuestasBloque, selectedBloque, alumnosCuenta]);

  // Cargar bloques al montar componente
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener bloques del profesor
      const bloquesData = await bloquesService.getAll();
      setBloques(bloquesData);

      // Obtener cantidad de alumnos por bloque
      const conteoAlumnos = {};
      for (const bloque of bloquesData) {
        try {
          const alumnos = await alumnosService.getByBloque(bloque.id);
          conteoAlumnos[bloque.id] = alumnos.length;
        } catch {
          conteoAlumnos[bloque.id] = 0;
        }
      }
      setAlumnosCuenta(conteoAlumnos);

      // Obtener últimas respuestas (opcional, puede fallar)
      try {
        const respuestas = await respuestasService.getByProfesor();
        setUltimasRespuestas(respuestas.slice(0, 5)); // Últimas 5
      } catch {
        setUltimasRespuestas([]);
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente (fetch asíncrono, no estado derivado)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarDatos();
  }, []);

  // Limpiar feedbacks después de 4 segundos
  useEffect(() => {
    if (!bloqueFeedback && !moduloFeedback && !contenidoFeedback) return undefined;

    const timeoutId = window.setTimeout(() => {
      setBloqueFeedback(null);
      setModuloFeedback(null);
      setContenidoFeedback(null);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [bloqueFeedback, moduloFeedback, contenidoFeedback]);

  // Handlers de acciones
  const handleCrearBloque = () => {
    setBloqueEnEdicion(null);
    setModalOpen(true);
  };

  // Abrir modal de información del bloque
  const abrirConfirmacion = (accion) => {
    setRespuestaContenidoId(accion?.id ?? null);
    setConfirmacionAccion(accion);
  };

  // Abrir confirmación para eliminar bloque
  const abrirConfirmacionEliminarBloque = (bloque) => {
    abrirConfirmacion({
      tipo: 'eliminar-bloque',
      titulo: 'Eliminar bloque',
      mensaje: `Esta acción eliminará el bloque ${bloque?.nivel || ''} - ${bloque?.anio || ''}.`,
      icono: 'trash',
      variante: 'danger',
      id: bloque?.id,
    });
  };

  // Abrir confirmación para editar bloque
  const abrirConfirmacionEditarBloque = (bloque) => {
    abrirConfirmacion({
      tipo: 'editar-bloque',
      titulo: 'Editar bloque',
      mensaje: 'Vas a abrir el formulario para ajustar este bloque. Revisa los datos antes de guardar.',
      icono: 'edit',
      variante: 'warning',
      id: bloque?.id,
    });
  };

  // Abrir confirmación para eliminar módulo
  const abrirConfirmacionEliminarModulo = (moduloId) => {
    abrirConfirmacion({
      tipo: 'eliminar-modulo',
      titulo: 'Eliminar módulo',
      mensaje: 'Esta acción eliminará el módulo y su estructura asociada. Si ya tiene actividades respondidas, no podrás eliminarlo.',
      icono: 'trash',
      variante: 'danger',
      id: moduloId,
    });
  };

  // Abrir confirmación para eliminar contenido
  const handleEliminarBloque = async (e, bloqueId) => {
    if (e) e.stopPropagation();
    if (!bloqueId) return;

    setBloqueFeedback(null);
    try {
      await eliminarBloque(bloqueId);
      await cargarDatos();
      setSelectedBloque(null);
    } catch (err) {
      setBloqueFeedback({ message: err?.message || 'Error al eliminar el bloque', type: 'error' });
    }
  };

  // Guardar bloque (crear o actualizar)
  const handleGuardarBloque = async (formData) => {
    setBloqueFeedback(null);
    try {
      if (bloqueEnEdicion) {
        // Actualizar
        await actualizarBloque(bloqueEnEdicion.id, formData);
      } else {
        // Crear
        await crearBloque(formData);
      }
      setModalOpen(false);
      setBloqueEnEdicion(null);
      await cargarDatos(); // Recargar lista
      setBloqueFeedback({ message: 'Cambios guardados correctamente', type: 'success' });
    } catch (err) {
      console.error('Error guardando bloque:', err);
      setBloqueFeedback({ message: err?.message || 'No se pudo guardar el bloque', type: 'error' });
    }
  };

  // Seleccionar bloque y cargar sus modulos, respuestas y alumnos
  const handleSeleccionarBloque = async (bloque) => {
    setSelectedBloque(bloque);
    setActiveDetalleTab('modulos');
    setNuevoModulo({ fecha: getTodayLocalInputDate(), estado: 'oculto' });
    setModuloExpandidoId(null);
    setContenidoEnEdicion(null);
    setBusquedaAlumno('');
    setCandidatosAlumnos([]);
    await Promise.all([
      cargarModulosDelBloque(bloque?.id),
      cargarRespuestasDelBloque(bloque?.id),
      cargarAlumnosDelBloque(bloque?.id),
    ]);
  };

  //Buscar candidatos a alumnos por nombre o email
  const handleBuscarCandidatos = async (e) => {
    e.preventDefault();

    const query = busquedaAlumno.trim();
    
    if (!selectedBloque?.id) return;
    if (query.length < 2) {
      setError('Ingresa al menos 2 caracteres para buscar alumnos');
      return;
    }

    setBuscandoCandidatos(true);
    try {
      const candidatos = await alumnosService.buscarCandidatos(selectedBloque.id, query);
      setCandidatosAlumnos(candidatos);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Error buscando alumnos');
      setCandidatosAlumnos([]);
    } finally {
      setBuscandoCandidatos(false);
    }
  };

  // Invitar alumno al bloque
  const handleInvitarAlumno = async (alumnoId) => {
    if (!selectedBloque?.id || !alumnoId) return;

    setInvitandoAlumnoId(alumnoId);
    try {
      await invitarAlumno(selectedBloque.id, alumnoId);
      const alumnosActualizados = await cargarAlumnosDelBloque(selectedBloque.id);
      setCandidatosAlumnos((prev) => prev.filter((candidato) => candidato.usuarioId !== alumnoId));
      setAlumnosCuenta((prev) => ({
        ...prev,
        [selectedBloque.id]: alumnosActualizados.length,
      }));
      setError(null);
    } catch (err) {
      setError(err?.message || 'Error invitando alumno');
    } finally {
      setInvitandoAlumnoId(null);
    }
  };

  // Remover alumno del bloque
  const handleRemoverAlumno = async (alumnoId) => {
    if (!selectedBloque?.id || !alumnoId) return;
    if (!window.confirm('¿Estas seguro de remover a este alumno del bloque?')) return;

    setRemoviendoAlumnoId(alumnoId);
    try {
      await removerAlumno(selectedBloque.id, alumnoId);
      const alumnosActualizados = await cargarAlumnosDelBloque(selectedBloque.id);
      setAlumnosCuenta((prev) => ({
        ...prev,
        [selectedBloque.id]: alumnosActualizados.length,
      }));
      setError(null);
    } catch (err) {
      setError(err?.message || 'Error removiendo alumno');
    } finally {
      setRemoviendoAlumnoId(null);
    }
  };

  // Crear nuevo módulo
  const handleCrearModulo = async (e) => {
    e.preventDefault();

    if (!selectedBloque?.id) {
      setModuloFeedback('Selecciona un bloque antes de crear un módulo');
      return;
    }

    setModuloFeedback(null);
    try {
      await crearModulo({
        bloqueId: selectedBloque.id,
        fecha: nuevoModulo.fecha,
        estado: nuevoModulo.estado,
      });
    setNuevoModulo({ fecha: getTodayLocalInputDate(), estado: 'oculto' });
      await cargarDatos();
      await cargarModulosDelBloque(selectedBloque.id);
    } catch (err) {
      console.error('Error creando módulo:', err);
      const mensaje = err?.message || 'Error al crear el módulo';
      setModuloFeedback(mensaje);
    }
  };

  // Expandir o colapsar módulo
  const handleToggleModulo = (modulo) => {
    const abriendo = moduloExpandidoId !== modulo.id;
    setModuloExpandidoId(abriendo ? modulo.id : null);
    setNuevoContenido(CONTENIDO_VACIO);
    setContenidoEnEdicion(null);
  };

  // Cambiar estado del módulo (habilitado/oculto)
  const handleCambiarEstadoModulo = async (modulo, nuevoEstado) => {
    const cantidadContenidos = modulo.contenidos?.length || 0;

    if (nuevoEstado === 'habilitado' && cantidadContenidos === 0) {
      setModuloFeedback('Agrega al menos una actividad antes de habilitar el módulo a los alumnos');
      return;
    }

    setModuloFeedback(null);
    try {
      await actualizarModulo(modulo.id, { estado: nuevoEstado });
      await cargarModulosDelBloque(selectedBloque.id);
    } catch (err) {
      console.error('Error actualizando estado del módulo:', err);
      setModuloFeedback(err?.message || 'Error al actualizar el estado del módulo');
    }
  };

  // Eliminar módulo
  const handleEliminarModulo = async (moduloId) => {
    setModuloFeedback(null);
    try {
      await eliminarModulo(moduloId);
      if (moduloExpandidoId === moduloId) {
        setModuloExpandidoId(null);
      }
      await cargarDatos();
      await cargarModulosDelBloque(selectedBloque.id);
    } catch (err) {
      console.error('Error eliminando módulo:', err);
      setModuloFeedback(err?.message || 'Error al eliminar el módulo');
    }
  };

  // Crear nuevo contenido (actividad, pregunta, texto, audio) en un módulo
  const handleCrearContenido = async (e, moduloId) => {
    e.preventDefault();

    if (!nuevoContenido.contenido.trim()) {
      setContenidoFeedback('El contenido de la actividad es requerido');
      return;
    }

    setContenidoFeedback(null);
    try {
      await crearContenido({
        moduloId,
        tipo: nuevoContenido.tipo,
        contenido: nuevoContenido.contenido,
        orden: Number(nuevoContenido.orden) || 0,
      });
      setNuevoContenido(CONTENIDO_VACIO);
      await cargarModulosDelBloque(selectedBloque.id);
    } catch (err) {
      console.error('Error creando actividad:', err);
      setContenidoFeedback(err?.message || 'Error al crear la actividad');
    }
  };

  // Iniciar edición de contenido
  const handleIniciarEdicionContenido = (contenido) => {
    setContenidoEnEdicion({
      id: contenido.id,
      tipo: contenido.tipo,
      contenido: contenido.contenido,
      orden: contenido.orden,
    });
  };

  // Guardar edición de contenido
  const handleGuardarEdicionContenido = async (e) => {
    e.preventDefault();
    if (!contenidoEnEdicion) return;

    setContenidoFeedback(null);
    try {
      await actualizarContenido(contenidoEnEdicion.id, {
        tipo: contenidoEnEdicion.tipo,
        contenidoActualizado: contenidoEnEdicion.contenido,
        orden: Number(contenidoEnEdicion.orden) || 0,
      });
      setContenidoEnEdicion(null);
      await cargarModulosDelBloque(selectedBloque.id);
    } catch (err) {
      console.error('Error actualizando actividad:', err);
      setContenidoFeedback(err?.message || 'Error al actualizar la actividad');
    }
  };

  // Eliminar contenido
  const handleEliminarContenido = async (contenidoId) => {
    if (!selectedBloque?.id) return;

    setContenidoFeedback(null);
    try {
      await eliminarContenido(contenidoId);
      await cargarModulosDelBloque(selectedBloque.id);
      setConfirmacionAccion(null);
      setRespuestaContenidoId(null);
    } catch (err) {
      console.error('Error eliminando actividad:', err);
      setContenidoFeedback(err?.message || 'Error al eliminar la actividad');
    }
  };

  const abrirConfirmacionEliminarContenido = (contenidoId) => {
    setRespuestaContenidoId(contenidoId);
    setConfirmacionAccion({
      tipo: 'eliminar-contenido',
      titulo: 'Eliminar actividad',
      mensaje: 'Esta acción eliminará la actividad del módulo. Si ya tiene respuestas de alumnos, no podrá completarse.',
      icono: 'trash',
      variante: 'danger',
    });
  };

  const abrirConfirmacionEditarContenido = (contenido) => {
    setRespuestaContenidoId(contenido.id);
    setConfirmacionAccion({
      tipo: 'editar-contenido',
      titulo: 'Editar actividad',
      mensaje: 'Si la actividad ya fue respondida por alumnos, no podrás modificarla para no afectar el historial.',
      icono: 'edit',
      variante: 'warning',
    });
  };

  const confirmarAccion = async () => {
    if (!confirmacionAccion) return;

    if (confirmacionAccion.tipo === 'eliminar-contenido') {
      await handleEliminarContenido(respuestaContenidoId);
    }

    if (confirmacionAccion.tipo === 'editar-contenido') {
      const contenido = modulos
        .flatMap((modulo) => modulo.contenidos || [])
        .find((item) => item.id === respuestaContenidoId);

      if (contenido) {
        handleIniciarEdicionContenido(contenido);
      }
    }

    if (confirmacionAccion.tipo === 'eliminar-bloque') {
      await handleEliminarBloque(null, confirmacionAccion.id);
    }

    if (confirmacionAccion.tipo === 'editar-bloque') {
      const bloque = bloques.find((item) => item.id === confirmacionAccion.id);
      if (bloque) {
        setBloqueEnEdicion(bloque);
        setModalOpen(true);
      }
    }

    if (confirmacionAccion.tipo === 'eliminar-modulo') {
      await handleEliminarModulo(confirmacionAccion.id);
    }

    setConfirmacionAccion(null);
    setRespuestaContenidoId(null);
  };

  const alternarRespuestasContenido = (contenidoId) => {
    setContenidoRespuestaExpandidoId((actual) => (actual === contenidoId ? null : contenidoId));
  };



  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <img src="/Target.png" alt="Target Catriel" className="dashboard-header-logo" />
          <div className="dashboard-header-text">
            <span className="dashboard-header-brand">Teacher Portal</span>
            <span className="dashboard-header-greeting">Hello, {user?.nombre || user?.name || 'Professor'}</span>
          </div>
        </div>
        <button onClick={logout} className="btn-logout">
          <Icon name="logout" className="icon-button" />
          Sign out
        </button>
      </header>

      {error && (
        <div className="error-alert">{error}</div>
      )}

      <div className="dashboard-content">
        <section className="section-bloques">
          <div className="section-header">
            <h2>Mis Bloques</h2>
            <div className="section-header-actions">
              <button className="btn-secondary" onClick={() => setInfoModalOpen(true)}>
                <Icon name="help" className="icon-button" />
                Ver reglas de gestión
              </button>
              <button className="btn-primary" onClick={handleCrearBloque}>
                <Icon name="spark" className="icon-button" />
                Crear bloque
              </button>
            </div>
          </div>

          {bloqueFeedback && (
            <div
              className={`inline-feedback-banner ${bloqueFeedback.type === 'success' ? 'inline-feedback-banner-success' : 'inline-feedback-banner-error'} feedback-toast`}
              role="status"
              aria-live="polite"
              onClick={() => {
                setBloqueFeedback(null);
                setModuloFeedback(null);
                setContenidoFeedback(null);
              }}
            >
              <span className="feedback-toast-icon" aria-hidden="true">{bloqueFeedback.type === 'success' ? '✓' : '⚠'}</span>
              <span>{bloqueFeedback.message}</span>
            </div>
          )}

          {loading ? (
            <div className="loading">Cargando bloques...</div>
          ) : bloques.length === 0 ? (
            <div className="empty-state">
              <p>No tienes bloques creados aún.</p>
              <button className="btn-primary" onClick={handleCrearBloque}>
                <Icon name="spark" className="icon-button" />
                Crear tu primer bloque
              </button>
            </div>
          ) : (
            <div className="bloques-grid">
              {bloques.map(bloque => (
                <div
                  key={bloque.id}
                  className={`bloque-card${selectedBloque?.id === bloque.id ? ' bloque-card-selected' : ''}`}
                  onClick={() => handleSeleccionarBloque(bloque)}
                >
                  <h3>{bloque.nivel} - {bloque.anio}</h3>
                  <div className="bloque-card-meta">
                    <span>
                      <Icon name="calendar" className="icon-inline" />
                      {formatDias(bloque.dias)}
                    </span>
                    <span>
                      <Icon name="clock" className="icon-inline" />
                      {formatHorario(bloque.horaInicio, bloque.horaFin)}
                    </span>
                  </div>
                  <div className="bloque-stats">
                    <span>
                      <Icon name="users" className="icon-inline" />
                      {alumnosCuenta[bloque.id] || 0} alumnos
                    </span>
                    <span>
                      <Icon name="layers" className="icon-inline" />
                      {bloque.modulos?.length || 0} módulos
                    </span>
                  </div>
                  <div className="bloque-actions">
                    <button
                      className="btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSeleccionarBloque(bloque);
                      }}
                    >
                      <Icon name="eye" className="icon-button" />
                      Ver Detalle
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirConfirmacionEditarBloque(bloque);
                      }}
                    >
                      <Icon name="edit" className="icon-button" />
                      Editar
                    </button>
                    <button
                      className="btn-danger btn-icon-only"
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirConfirmacionEliminarBloque(bloque);
                      }}
                      aria-label="Eliminar bloque"
                    >
                      <Icon name="trash" className="icon-button" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {ultimasRespuestas.length > 0 && (
          <section className="section-respuestas">
            <div className="section-header">
              <h2>Últimas Respuestas</h2>
              <button
                className="btn-secondary"
                onClick={() => setRespuestasVisible((prev) => !prev)}
              >
                <Icon name={respuestasVisible ? 'eye-off' : 'eye'} className="icon-button" />
                {respuestasVisible ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {respuestasVisible && (
              <div className="respuestas-list">
                {ultimasRespuestas.map((resp, idx) => (
                  <div key={idx} className="respuesta-item">
                    <p className="respuesta-alumno">De: {resp.alumno?.usuario?.nombre || resp.alumno?.usuario?.email || 'Alumno sin nombre'}</p>
                    <p className="respuesta-contenido">{resp.respuesta}</p>
                    <small>{new Date(resp.createdAt).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {selectedBloque && (
          <section className="section-detalle profesor-detalle">
            <div className="detalle-header">
              <div className="detalle-header-left">
                <h2>
                  <Icon name="book" className="icon-inline" />
                  {selectedBloque.nivel} - {selectedBloque.anio}
                </h2>
                <p className="detalle-subtitle">
                  Vista de gestión del bloque: crea módulos, publica actividades y organiza el seguimiento.
                </p>
              </div>
              <button
                className="btn-close btn-close-friendly"
                onClick={() => {
                  setSelectedBloque(null);
                  setRespuestasBloque([]);
                  setAlumnosBloque([]);
                  setCandidatosAlumnos([]);
                  setBusquedaAlumno('');
                }}
              >
                <Icon name="arrow-left" className="icon-button" />
                Volver a bloques
              </button>
            </div>
            <div className="tabs dashboard-tabs" role="tablist" aria-label="Secciones del bloque">
              <button
                className={`tab tab-rich${activeDetalleTab === 'modulos' ? ' active' : ''}`}
                type="button"
                onClick={() => setActiveDetalleTab('modulos')}
                aria-current={activeDetalleTab === 'modulos' ? 'page' : undefined}
              >
                <Icon name="layers" className="icon-inline" />
                <span>
                  Módulos
                  <small>Gestión activa</small>
                </span>
              </button>
              <button
                className={`tab tab-rich${activeDetalleTab === 'alumnos' ? ' active' : ''}`}
                type="button"
                onClick={() => setActiveDetalleTab('alumnos')}
                aria-current={activeDetalleTab === 'alumnos' ? 'page' : undefined}
              >
                <Icon name="users" className="icon-inline" />
                <span>
                  Alumnos
                  <small>Gestión activa</small>
                </span>
              </button>
              <button
                className={`tab tab-rich${activeDetalleTab === 'recursos' ? ' active' : ''}`}
                type="button"
                onClick={() => setActiveDetalleTab('recursos')}
                aria-current={activeDetalleTab === 'recursos' ? 'page' : undefined}
              >
                <Icon name="doc" className="icon-inline" />
                <span>
                  Recursos
                  <small>Próximamente</small>
                </span>
              </button>
              <button
                className={`tab tab-rich${activeDetalleTab === 'asistencia' ? ' active' : ''}`}
                type="button"
                onClick={() => setActiveDetalleTab('asistencia')}
                aria-current={activeDetalleTab === 'asistencia' ? 'page' : undefined}
              >
                <Icon name="checklist" className="icon-inline" />
                <span>
                  Asistencia
                  <small>Próximamente</small>
                </span>
              </button>
            </div>
            <div className="tab-content">
              {activeDetalleTab === 'modulos' && (
                <>
                  {moduloFeedback && (
                    <div
                      className="inline-feedback-banner inline-feedback-banner-error feedback-toast"
                      role="status"
                      aria-live="polite"
                      onClick={() => {
                        setBloqueFeedback(null);
                        setModuloFeedback(null);
                        setContenidoFeedback(null);
                      }}
                    >
                      <span className="feedback-toast-icon" aria-hidden="true">⚠</span>
                      <span>{moduloFeedback}</span>
                    </div>
                  )}

                  <div className="modulo-creation-card" aria-label="Crear nuevo módulo">
                    <div className="modulo-creation-intro">
                      <span className="modulo-creation-badge">Nuevo</span>
                      <div>
                        <h3>Crear nuevo módulo</h3>
                        <p>Define la fecha y el estado del módulo antes de empezar a cargar actividades.</p>
                      </div>
                    </div>
                    <form className="modulo-creation-form" onSubmit={handleCrearModulo}>
                      <label>
                        <span className="label-inline">
                          <Icon name="calendar" className="icon-inline" />
                          Fecha
                        </span>
                        <input
                          type="date"
                          value={nuevoModulo.fecha}
                          onChange={(e) => setNuevoModulo({ ...nuevoModulo, fecha: e.target.value })}
                          required
                        />
                      </label>
                      <label>
                        Estado
                        <select
                          value={nuevoModulo.estado}
                          onChange={(e) => setNuevoModulo({ ...nuevoModulo, estado: e.target.value })}
                        >
                          <option value="oculto">Oculto</option>
                          <option value="habilitado">Habilitado</option>
                        </select>
                      </label>
                      <button type="submit" className="btn-primary">
                        <Icon name="spark" className="icon-button" />
                        Crear módulo
                      </button>
                    </form>
                  </div>

                  <div className="modulos-section-header">
                    <div>
                      <h3>Módulos existentes</h3>
                      <p>Revisa y administra los módulos que ya están en este bloque.</p>
                    </div>
                    <span className="modulos-count-badge">{modulos.length} módulo{modulos.length === 1 ? '' : 's'}</span>
                  </div>

                  <div className="modulos-list">
                    {modulos.length === 0 ? (
                      <div className="modulo-empty-state">
                        <Icon name="layers" className="icon-inline" />
                        <p>No hay módulos creados para este bloque todavía.</p>
                      </div>
                    ) : (
                      modulos.map((modulo) => {
                        const expandido = moduloExpandidoId === modulo.id;
                        const contenidos = modulo.contenidos || [];
                        const metricas = moduloMetricas[modulo.id] || {
                          actividades: contenidos.length,
                          respuestas: 0,
                          participantesUnicos: 0,
                          porcentajeParticipacion: 0,
                        };

                        return (
                          <div key={modulo.id} className={`modulo-card${expandido ? ' expandido' : ''}`}>
                            <div
                              className="modulo-header modulo-header-clickable"
                              onClick={() => handleToggleModulo(modulo)}
                            >
                              <h3>
                                <Icon name="calendar" className="icon-inline" />
                                {formatDateOnlyUTC(modulo.fecha)}
                              </h3>
                              <div className="modulo-header-right">
                                <span className={`badge-estado badge-estado-${modulo.estado}`}>{modulo.estado}</span>
                                <button
                                  type="button"
                                  className="modulo-delete-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    abrirConfirmacionEliminarModulo(modulo.id);
                                  }}
                                  aria-label="Eliminar módulo"
                                  disabled={actionLoading}
                                >
                                  <Icon name="trash" className="icon-button" />
                                </button>
                                <Icon name="chevron" className={`icon-chevron${expandido ? ' expanded' : ''}`} />
                              </div>
                            </div>
                            <div className="modulo-meta">
                              <span className="modulo-meta-item">
                                <Icon name="checklist" className="icon-inline" />
                                {metricas.actividades} actividad{metricas.actividades === 1 ? '' : 'es'}
                              </span>
                              <span className="modulo-meta-item modulo-meta-item-respuestas">
                                {metricas.respuestas} respuesta{metricas.respuestas === 1 ? '' : 's'}
                              </span>
                              <span className="modulo-meta-item modulo-meta-item-participacion">
                                {metricas.porcentajeParticipacion}% participación
                              </span>
                            </div>

                            <div className="modulo-participacion-bar" aria-label="Progreso de participación del módulo">
                              <div
                                className="modulo-participacion-fill"
                                style={{ width: `${metricas.porcentajeParticipacion}%` }}
                              />
                            </div>
                            <p className="modulo-participacion-texto">
                              {metricas.participantesUnicos} de {selectedBloque?.id ? (alumnosCuenta[selectedBloque.id] || 0) : 0} alumnos participaron
                            </p>

                            {expandido && (
                              <div className="modulo-detalle-panel" onClick={(e) => e.stopPropagation()}>
                                <div className="modulo-detalle-layout">
                                  <aside className="estado-card">
                                    <div className="estado-selector">
                                      <label htmlFor={`estado-${modulo.id}`}>Estado del módulo</label>
                                      <select
                                        id={`estado-${modulo.id}`}
                                        value={modulo.estado}
                                        onChange={(e) => handleCambiarEstadoModulo(modulo, e.target.value)}
                                        disabled={actionLoading}
                                      >
                                        <option value="oculto">Oculto</option>
                                        <option value="habilitado">Habilitado (visible para alumnos)</option>
                                      </select>
                                      {contenidos.length === 0 && (
                                        <small className="hint-warning">
                                          Agrega al menos una actividad para poder habilitar este modulo.
                                        </small>
                                      )}
                                    </div>
                                  </aside>

                                  <div className="contenidos-section contenidos-card">
                                    {contenidoFeedback && (
                                      <div
                                        className="inline-feedback-banner inline-feedback-banner-error feedback-toast"
                                        role="status"
                                        aria-live="polite"
                                        onClick={() => {
                                          setBloqueFeedback(null);
                                          setModuloFeedback(null);
                                          setContenidoFeedback(null);
                                        }}
                                      >
                                        <span className="feedback-toast-icon" aria-hidden="true">⚠</span>
                                        <span>{contenidoFeedback}</span>
                                      </div>
                                    )}
                                    <h4>Actividades del módulo</h4>
                                    {contenidos.length === 0 ? (
                                      <p className="empty-contenidos">Todavía no hay actividades definidas.</p>
                                    ) : (
                                      <div className="contenidos-list">
                                        {contenidos.map((contenido) => {
                                          const respuestasDelContenido = respuestasBloque.filter((respuesta) => respuesta?.contenido?.id === contenido.id);
                                          const tieneRespuestas = respuestasDelContenido.length > 0;

                                          return (
                                            <div key={contenido.id} className="contenido-item">
                                              {contenidoEnEdicion?.id === contenido.id ? (
                                                <form className="contenido-form" onSubmit={handleGuardarEdicionContenido}>
                                                  <select
                                                    value={contenidoEnEdicion.tipo}
                                                    onChange={(e) => setContenidoEnEdicion({ ...contenidoEnEdicion, tipo: e.target.value })}
                                                  >
                                                    {TIPOS_CONTENIDO.map((t) => (
                                                      <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                  </select>
                                                  <textarea
                                                    value={contenidoEnEdicion.contenido}
                                                    onChange={(e) => setContenidoEnEdicion({ ...contenidoEnEdicion, contenido: e.target.value })}
                                                    required
                                                  />
                                                  <div className="contenido-form-actions">
                                                    <button type="submit" className="btn-primary" disabled={actionLoading}>Guardar</button>
                                                    <button type="button" className="btn-secondary" onClick={() => setContenidoEnEdicion(null)}>Cancelar</button>
                                                  </div>
                                                </form>
                                              ) : (
                                                <>
                                                  <div className="contenido-info">
                                                    <span className="badge-tipo">{contenido.tipo}</span>
                                                    <p>{contenido.contenido}</p>
                                                    {tieneRespuestas && (
                                                      <div className="contenido-respuestas-pill">
                                                        {respuestasDelContenido.length} respuesta{respuestasDelContenido.length === 1 ? '' : 's'}
                                                      </div>
                                                    )}
                                                    {contenidoRespuestaExpandidoId === contenido.id && !contenidoEnEdicion?.id && (
                                                      <div className="contenido-respuestas-thread">
                                                        <div className="contenido-respuestas-thread-header">
                                                          <span>Comentarios</span>
                                                          {/* <span>{respuestasDelContenido.length}</span> */}
                                                        </div>
                                                        {respuestasDelContenido.length === 0 ? (
                                                          <p className="contenido-respuestas-vacio">Todavía no hay respuestas para esta actividad.</p>
                                                        ) : (
                                                          <div className="contenido-respuestas-list">
                                                            {respuestasDelContenido.map((respuesta) => (
                                                              <div key={respuesta.id} className="contenido-respuesta-comment">
                                                                <div className="contenido-respuesta-dot" />
                                                                <div className="contenido-respuesta-body">
                                                                  <div className="contenido-respuesta-meta">
                                                                    <span className="contenido-respuesta-alumno">
                                                                      {respuesta.alumno?.usuario?.nombre || respuesta.alumno?.usuario?.email || 'Alumno sin nombre'}
                                                                    </span>
                                                                    <small>{new Date(respuesta.createdAt).toLocaleDateString('es-AR')}</small>
                                                                  </div>
                                                                  <p className="contenido-respuesta-texto">{respuesta.respuesta}</p>
                                                                </div>
                                                              </div>
                                                            ))}
                                                          </div>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                  <div className="contenido-actions">
                                                    <button
                                                      className={`btn-pequeño btn-toggle-respuestas${contenidoRespuestaExpandidoId === contenido.id ? ' active' : ''}`}
                                                      onClick={() => alternarRespuestasContenido(contenido.id)}
                                                      aria-pressed={contenidoRespuestaExpandidoId === contenido.id}
                                                    >
                                                      <Icon name={contenidoRespuestaExpandidoId === contenido.id ? 'eye-off' : 'eye'} className="icon-button" />
                                                      {contenidoRespuestaExpandidoId === contenido.id ? 'Ocultar respuestas' : 'Ver respuestas'}
                                                    </button>
                                                    <button className="btn-pequeño" onClick={() => abrirConfirmacionEditarContenido(contenido)}>
                                                      <Icon name="edit" className="icon-button" />
                                                      Editar
                                                    </button>
                                                    <button className="btn-danger btn-icon-only" onClick={() => abrirConfirmacionEliminarContenido(contenido.id)} aria-label="Eliminar actividad">
                                                      <Icon name="trash" className="icon-button" />
                                                    </button>
                                                  </div>
                                                </>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    <form
                                      className="contenido-form contenido-form-nuevo contenido-builder"
                                      onSubmit={(e) => handleCrearContenido(e, modulo.id)}
                                    >
                                      <div className="builder-header">
                                        <div>
                                          <h5>
                                            <Icon name={contenidoMetaActual.icono} className="icon-inline" />
                                            Nueva actividad
                                          </h5>
                                          <p>{contenidoMetaActual.ayuda}</p>
                                        </div>
                                      </div>

                                      <div className="tipo-chips" role="tablist" aria-label="Tipo de actividad">
                                        {TIPOS_CONTENIDO.map((tipo) => (
                                          <button
                                            key={tipo.value}
                                            type="button"
                                            className={`tipo-chip${nuevoContenido.tipo === tipo.value ? ' active' : ''}`}
                                            onClick={() => setNuevoContenido({ ...nuevoContenido, tipo: tipo.value })}
                                          >
                                            <Icon name={CONTENIDO_META[tipo.value].icono} className="icon-inline" />
                                            {tipo.label}
                                          </button>
                                        ))}
                                      </div>

                                      <label className="builder-field builder-field-full">
                                        Contenido
                                        <textarea
                                          placeholder={contenidoMetaActual.placeholder}
                                          value={nuevoContenido.contenido}
                                          onChange={(e) => setNuevoContenido({ ...nuevoContenido, contenido: e.target.value })}
                                          required
                                        />
                                        <small className="contenido-counter">
                                          {nuevoContenido.contenido.length} caracteres
                                        </small>
                                      </label>

                                      <div className="builder-actions">
                                        <button type="submit" className="btn-primary" disabled={actionLoading}>
                                          <Icon name="spark" className="icon-button" />
                                          Agregar {contenidoMetaActual.titulo.toLowerCase()}
                                        </button>
                                      </div>
                                    </form>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}

              {activeDetalleTab === 'alumnos' && (
                <div className="alumnos-tab-content">
                  <div className="alumnos-card">
                    <div className="alumnos-card-header">
                      <h3>Invitar alumno al bloque</h3>
                      <p>Busca por nombre o email y agregalo al bloque seleccionado.</p>
                    </div>
                    <form className="alumnos-search-form" onSubmit={handleBuscarCandidatos}>
                      <input
                        type="text"
                        value={busquedaAlumno}
                        placeholder="Ejemplo: juan o juan@email.com"
                        onChange={(e) => setBusquedaAlumno(e.target.value)}
                      />
                      <button type="submit" className="btn-primary" disabled={buscandoCandidatos}>
                        {buscandoCandidatos ? 'Buscando...' : 'Buscar alumno'}
                      </button>
                    </form>

                    <div className="alumnos-candidatos-list">
                      {candidatosAlumnos.length === 0 ? (
                        <p className="alumnos-hint">No hay resultados para mostrar. Realiza una busqueda para invitar.</p>
                      ) : (
                        candidatosAlumnos.map((candidato) => (
                          <div key={candidato.usuarioId} className="alumno-row">
                            <div>
                              <p className="alumno-row-name">{candidato.usuario?.nombre || 'Alumno sin nombre'}</p>
                              <small>{candidato.usuario?.email || 'Sin email'}</small>
                            </div>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => handleInvitarAlumno(candidato.usuarioId)}
                              disabled={invitandoAlumnoId === candidato.usuarioId || actionLoading}
                            >
                              {invitandoAlumnoId === candidato.usuarioId ? 'Invitando...' : 'Invitar'}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="alumnos-card">
                    <div className="alumnos-card-header">
                      <h3>Alumnos inscriptos</h3>
                      <p>{alumnosBloque.length} alumno{alumnosBloque.length === 1 ? '' : 's'} en este bloque.</p>
                    </div>

                    {alumnosLoading ? (
                      <div className="loading">Cargando alumnos...</div>
                    ) : alumnosBloque.length === 0 ? (
                      <p className="alumnos-hint">Todavia no hay alumnos inscriptos en este bloque.</p>
                    ) : (
                      <div className="alumnos-inscritos-list">
                        {alumnosBloque.map((inscripcion) => (
                          <div key={inscripcion.id} className="alumno-row">
                            <div>
                              <p className="alumno-row-name">{inscripcion.alumno?.usuario?.nombre || 'Alumno sin nombre'}</p>
                              <small>{inscripcion.alumno?.usuario?.email || 'Sin email'}</small>
                            </div>
                            <button
                              type="button"
                              className="btn-danger"
                              onClick={() => handleRemoverAlumno(inscripcion.alumno?.usuarioId)}
                              disabled={removiendoAlumnoId === inscripcion.alumno?.usuarioId || actionLoading}
                            >
                              {removiendoAlumnoId === inscripcion.alumno?.usuarioId ? 'Removiendo...' : 'Remover'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(activeDetalleTab === 'recursos' || activeDetalleTab === 'asistencia') && (
                <div className="modulo-empty-state">
                  <Icon name="spark" className="icon-inline" />
                  <p>Esta seccion se habilitara en la siguiente fase del roadmap.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <BloqueModal
        isOpen={modalOpen}
        bloque={bloqueEnEdicion}
        onClose={() => {
          setModalOpen(false);
          setBloqueEnEdicion(null);
        }}
        onSave={handleGuardarBloque}
        loading={actionLoading}
      />

      {confirmacionAccion && (
        <div className="modal-overlay" onClick={() => setConfirmacionAccion(null)}>
          <div className={`modal-content modal-content-info confirm-modal-card ${confirmacionAccion.variante === 'danger' ? 'confirm-modal-danger' : 'confirm-modal-warning'}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="confirm-modal-title-group">
                <div className={`confirm-icon-badge ${confirmacionAccion.variante === 'danger' ? 'danger' : 'warning'}`}>
                  <Icon name={confirmacionAccion.icono || 'help'} className="icon-button" />
                </div>
                <div>
                  <h2>{confirmacionAccion.titulo}</h2>
                  <p className="confirm-modal-subtitle">{confirmacionAccion.variante === 'danger' ? 'Acción sensible' : 'Revisión previa'}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setConfirmacionAccion(null)}>✕</button>
            </div>
            <div className="modal-form info-modal-body">
              <p className="info-modal-intro">{confirmacionAccion.mensaje}</p>
              <div className="info-modal-footer confirm-modal-footer">
                <button className="btn-secondary" onClick={() => setConfirmacionAccion(null)}>
                  Cancelar
                </button>
                <button className={`btn-confirm ${confirmacionAccion.variante === 'danger' ? 'btn-confirm-danger' : 'btn-confirm-warning'}`} onClick={confirmarAccion}>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {infoModalOpen && (
        <div className="modal-overlay" onClick={() => setInfoModalOpen(false)}>
          <div className="modal-content modal-content-info" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Guía de gestión académica</h2>
              <button className="modal-close" onClick={() => setInfoModalOpen(false)}>✕</button>
            </div>

            <div className="modal-form info-modal-body">
              <p className="info-modal-intro">
                Este flujo te ayuda a organizar el trabajo por bloque y evita cambios que afecten el historial de alumnos.
              </p>

              <h3>Procedimiento recomendado</h3>
              <ol className="info-modal-list">
                <li>
                  Crear bloque: define nivel, días, horario y año.
                </li>
                <li>
                  Crear módulo: agrega la fecha y déjalo oculto hasta cargar actividades.
                </li>
                <li>
                  Cargar actividades: texto, actividad, pregunta o audio.
                </li>
                <li>
                  Habilitar módulo: solo cuando tenga actividades listas para alumnos.
                </li>
                <li>
                  Ajustes posteriores: si ya hay respuestas de alumnos, crea una nueva versión en lugar de editar la existente.
                </li>
              </ol>

              <h3>Reglas de integridad de datos</h3>
              <ul className="info-modal-list">
                <li>Una actividad con respuestas de alumnos no se puede editar ni eliminar.</li>
                <li>Un módulo no se puede editar ni eliminar si alumnos realizaron actividades dentro de ese módulo.</li>
                <li>Un bloque con actividades realizadas no se puede eliminar.</li>
                <li>Un bloque con actividades realizadas no permite cambiar el nivel.</li>
                <li>No se puede habilitar un módulo sin actividades cargadas.</li>
              </ul>

              <div className="info-modal-footer">
                <button className="btn-primary" onClick={() => setInfoModalOpen(false)}>
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
