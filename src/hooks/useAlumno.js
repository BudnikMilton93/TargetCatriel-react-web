import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  alumnoAsistenciasService,
  alumnoBloquesService,
  alumnoModulosService,
  alumnoRespuestasService,
} from '../services/api';

/**
 * Hook para manejar los datos y la lógica del dashboard del alumno
 */
export function useAlumno() {
  const { user, logout } = useAuth();
  const [bloques, setBloques] = useState([]);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedModuloId, setExpandedModuloId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [visibilidades, setVisibilidades] = useState({});
  const [submittingContentId, setSubmittingContentId] = useState(null);
  const [deletingContentId, setDeletingContentId] = useState(null);
  const [respuestasCompartidas, setRespuestasCompartidas] = useState([]);
  const [confirmandoEliminacion, setConfirmandoEliminacion] = useState(null);
  const [confirmandoActualizacion, setConfirmandoActualizacion] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    const cargarDatos = async () => {
      setLoading(true);
      setError('');

      try {
        const bloquesData = await alumnoBloquesService.getAll();
        setBloques(bloquesData);

        const bloqueInicial = bloquesData[0] || null;
        setBloqueSeleccionado(bloqueInicial);

        if (bloqueInicial?.id) {
          const [modulosData, respuestasData, asistenciasData, respuestasCompartidasData] = await Promise.all([
            alumnoModulosService.getByBloque(bloqueInicial.id),
            alumnoRespuestasService.getAll(),
            alumnoAsistenciasService.getAll(),
            alumnoRespuestasService.getSharedByBloque(bloqueInicial.id),
          ]);

          setModulos(modulosData);
          setRespuestas(respuestasData);
          setAsistencias(asistenciasData?.asistencias || []);
          setRespuestasCompartidas(respuestasCompartidasData);
        } else {
          setModulos([]);
          setRespuestas([]);
          setAsistencias([]);
          setRespuestasCompartidas([]);
        }
      } catch (err) {
        setError(err.message || 'No se pudieron cargar tus datos de aprendizaje.');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [user?.id]);

  const seleccionarBloque = useCallback(async (bloque) => {
    if (!bloque?.id) return;

    setBloqueSeleccionado(bloque);
    setExpandedModuloId(null);
    setLoading(true);

    try {
      const [modulosData, respuestasData, asistenciasData, respuestasCompartidasData] = await Promise.all([
        alumnoModulosService.getByBloque(bloque.id),
        alumnoRespuestasService.getAll(),
        alumnoAsistenciasService.getAll(),
        alumnoRespuestasService.getSharedByBloque(bloque.id),
      ]);

      setModulos(modulosData);
      setRespuestas(respuestasData);
      setAsistencias(asistenciasData?.asistencias || []);
      setRespuestasCompartidas(respuestasCompartidasData);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los datos del bloque seleccionado.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const nextDrafts = {};
    const nextVisibilidades = {};

    respuestas.forEach((respuesta) => {
      if (respuesta?.contenido?.id) {
        nextDrafts[respuesta.contenido.id] = respuesta.respuesta || '';
        nextVisibilidades[respuesta.contenido.id] = respuesta.visibilidad || 'privado';
      }
    });

    setDrafts(nextDrafts);
    setVisibilidades(nextVisibilidades);
  }, [respuestas]);

  const totalContenidos = modulos.reduce((sum, modulo) => sum + (modulo.contenidos?.length || 0), 0);
  const respuestasDelBloque = respuestas.filter((respuesta) => {
    const moduloId = respuesta?.contenido?.modulo?.id;
    return modulos.some((modulo) => modulo.id === moduloId);
  });
  const respuestasPorContenidoId = respuestasDelBloque.reduce((acc, respuesta) => {
    if (respuesta?.contenido?.id) {
      acc[respuesta.contenido.id] = respuesta;
    }
    return acc;
  }, {});
  const progresoGeneral = totalContenidos > 0
    ? Math.round((respuestasDelBloque.length / totalContenidos) * 100)
    : 0;

  const asistenciasPresentes = asistencias.filter((item) => item.presente).length;
  const porcentajeAsistencia = asistencias.length > 0
    ? Math.round((asistenciasPresentes / asistencias.length) * 100)
    : 0;

  const handleDraftChange = useCallback((contenidoId, value) => {
    setDrafts((prev) => ({ ...prev, [contenidoId]: value }));
  }, []);

  const handleVisibilityChange = useCallback((contenidoId, value) => {
    setVisibilidades((prev) => ({ ...prev, [contenidoId]: value }));
  }, []);

  const recargarRespuestasDelBloque = useCallback(async () => {
    const [respuestasActualizadas, respuestasCompartidasData] = await Promise.all([
      alumnoRespuestasService.getAll(),
      alumnoRespuestasService.getSharedByBloque(bloqueSeleccionado?.id),
    ]);

    setRespuestas(respuestasActualizadas);
    setRespuestasCompartidas(respuestasCompartidasData);
  }, [bloqueSeleccionado?.id]);

  const handleSubmitRespuesta = useCallback(async (contenidoId) => {
    const texto = (drafts[contenidoId] || '').trim();
    if (!texto) {
      setError('Escribí una respuesta antes de enviarla.');
      return;
    }

    const respuestaExistente = respuestasPorContenidoId[contenidoId];

    // Si es actualización, pedir confirmación primero
    if (respuestaExistente?.id && confirmandoActualizacion !== contenidoId) {
      setConfirmandoActualizacion(contenidoId);
      return;
    }

    setConfirmandoActualizacion(null);
    setSubmittingContentId(contenidoId);
    setError('');

    try {
      if (respuestaExistente?.id) {
        await alumnoRespuestasService.update(respuestaExistente.id, {
          respuestaActualizada: texto,
          visibilidad: visibilidades[contenidoId] || 'privado',
        });
      } else {
        await alumnoRespuestasService.create({
          contenidoId,
          respuesta: texto,
          visibilidad: visibilidades[contenidoId] || 'privado',
        });
      }

      await recargarRespuestasDelBloque();
    } catch (err) {
      setError(err.message || 'No se pudo guardar la respuesta.');
    } finally {
      setSubmittingContentId(null);
    }
  }, [drafts, respuestasPorContenidoId, confirmandoActualizacion, visibilidades, recargarRespuestasDelBloque]);

  const handleDeleteRespuesta = useCallback(async (contenidoId) => {
    const respuestaExistente = respuestasPorContenidoId[contenidoId];
    if (!respuestaExistente?.id) return;

    // Pedir confirmación primero
    if (confirmandoEliminacion !== contenidoId) {
      setConfirmandoEliminacion(contenidoId);
      return;
    }

    setConfirmandoEliminacion(null);
    setDeletingContentId(contenidoId);
    setError('');

    try {
      await alumnoRespuestasService.delete(respuestaExistente.id);
      await recargarRespuestasDelBloque();
      setDrafts((prev) => ({ ...prev, [contenidoId]: '' }));
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la respuesta.');
    } finally {
      setDeletingContentId(null);
    }
  }, [respuestasPorContenidoId, confirmandoEliminacion, recargarRespuestasDelBloque]);

  return {
    user,
    logout,
    bloques,
    bloqueSeleccionado,
    modulos,
    respuestas,
    asistencias,
    loading,
    error,
    setError,
    expandedModuloId,
    setExpandedModuloId,
    drafts,
    visibilidades,
    submittingContentId,
    deletingContentId,
    respuestasCompartidas,
    confirmandoEliminacion,
    setConfirmandoEliminacion,
    confirmandoActualizacion,
    setConfirmandoActualizacion,
    seleccionarBloque,
    handleDraftChange,
    handleVisibilityChange,
    handleSubmitRespuesta,
    handleDeleteRespuesta,
    totalContenidos,
    respuestasDelBloque,
    respuestasPorContenidoId,
    progresoGeneral,
    asistenciasPresentes,
    porcentajeAsistencia,
  };
}
