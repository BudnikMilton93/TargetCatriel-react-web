import { useAlumno } from '../../../hooks/useAlumno';
import '../../../styles/pages/dashboard.css';

const TIPO_CONTENIDO_LABELS = {
  texto: 'Texto',
  actividad: 'Actividad',
  pregunta: 'Pregunta',
  audio: 'Audio',
};

function formatDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatTime(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatHorario(bloque) {
  if (!bloque) return '';

  const dias = bloque.dias || 'Sin días definidos';
  const inicio = formatTime(bloque.horaInicio);
  const fin = formatTime(bloque.horaFin);

  if (inicio && fin) {
    return `${dias} · ${inicio} a ${fin}`;
  }

  return dias;
}

function getTipoContenidoLabel(tipo) {
  return TIPO_CONTENIDO_LABELS[tipo] || tipo || 'Contenido';
}

export default function DashboardAlumno() {
  const {
    user,
    logout,
    bloques,
    bloqueSeleccionado,
    modulos,
    loading,
    error,
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
    porcentajeAsistencia,
  } = useAlumno();

  const displayName = user?.nombre || user?.name || 'Alumno';

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <img src="/Target.png" alt="Target Catriel" className="dashboard-header-logo" />
          <div className="dashboard-header-text">
            <span className="dashboard-header-brand">Student Portal</span>
            <span className="dashboard-header-greeting">Hello, {displayName}</span>
          </div>
        </div>
        <button onClick={logout} className="btn-logout">
          Sign out
        </button>
      </header>

      <div className="dashboard-content">
        {error && <div className="error-alert">{error}</div>}

        <section className="section-bloque-info">
          <div className="bloque-info-card">
            <div className="bloque-info-header">
              <div>
                <h2>{bloqueSeleccionado ? `${bloqueSeleccionado.nivel} · ${bloqueSeleccionado.anio}` : 'Sin bloques activos'}</h2>
                <p className="bloque-info-subtitle">{bloqueSeleccionado ? formatHorario(bloqueSeleccionado) : 'Aún no estás inscrito en ningún bloque.'}</p>
              </div>
              {bloques.length > 1 && (
                <div className="bloque-selector">
                  {bloques.map((bloque) => (
                    <button
                      key={bloque.id}
                      className={`btn-pequeño${bloqueSeleccionado?.id === bloque.id ? ' active' : ''}`}
                      onClick={() => seleccionarBloque(bloque)}
                    >
                      {bloque.nivel}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {bloqueSeleccionado && (
              <>
                <p><strong>Profesor:</strong> {bloqueSeleccionado.profesor?.nombre || 'Sin profesor asignado'}</p>
                <p><strong>Inicio:</strong> {formatDate(bloqueSeleccionado.createdAt)}</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progresoGeneral}%` }}></div>
                </div>
                <p className="progress-text">Progreso del bloque: {progresoGeneral}% · {respuestasDelBloque.length} de {totalContenidos} contenidos respondidos</p>
                <div className="stats-row">
                  <span className="stat-chip">Módulos: {modulos.length}</span>
                  <span className="stat-chip">Asistencia: {porcentajeAsistencia}%</span>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="section-modulos">
          <div className="section-header">
            <h2>Mis Módulos</h2>
            {bloqueSeleccionado && <span className="section-caption">Contenido cargado por el profesor</span>}
          </div>

          {loading ? (
            <div className="loading-state">Cargando tu progreso...</div>
          ) : !bloqueSeleccionado ? (
            <div className="empty-state">Todavía no tienes bloques asociados. Cuando el profesor te asigne uno, aparecerá aquí.</div>
          ) : modulos.length === 0 ? (
            <div className="empty-state">El profesor aún no ha cargado módulos para este bloque.</div>
          ) : (
            <div className="modulos-list">
              {modulos.map((modulo, index) => {
                const contenidos = modulo.contenidos || [];
                const respondidas = contenidos.filter((contenido) =>
                  respuestasDelBloque.some((respuesta) => respuesta.contenido?.id === contenido.id)
                ).length;
                const avance = contenidos.length > 0 ? Math.round((respondidas / contenidos.length) * 100) : 0;
                const expandido = expandedModuloId === modulo.id;
                const estado = modulo.estado === 'habilitado' ? 'Activo' : modulo.estado === 'oculto' ? 'Oculto' : 'Borrador';

                return (
                  <div key={modulo.id} className={`modulo-card ${expandido ? 'expandido' : ''}`}>
                    <div className="modulo-header">
                      <div>
                        <h3>Módulo {index + 1}</h3>
                        <p className="modulo-date">{formatDate(modulo.fecha)} · {estado}</p>
                      </div>
                      <div className="modulo-header-right">
                        <span className="badge-estado badge-estado-habilitado">{estado}</span>
                        <button className="btn-secondary" onClick={() => setExpandedModuloId(expandido ? null : modulo.id)}>
                          {expandido ? 'Ocultar' : 'Ver contenido'}
                        </button>
                      </div>
                    </div>

                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${avance}%` }}></div>
                    </div>
                    <p className="progress-text">Avance del módulo: {avance}% · {respondidas}/{contenidos.length} contenidos respondidos</p>

                    {expandido && (
                      <div className="modulo-detail-panel">
                        {contenidos.length === 0 ? (
                          <div className="empty-state">Este módulo todavía no tiene contenidos cargados.</div>
                        ) : (
                          <ul className="contenido-list">
                            {contenidos.map((contenido) => {
                              const respuestaExistente = respuestasPorContenidoId[contenido.id];
                              const valorActual = drafts[contenido.id] ?? '';
                              const visibilidadActual = visibilidades[contenido.id] || 'privado';

                              return (
                                <li key={contenido.id} className="contenido-item">
                                  <div className="activity-card">
                                    <div className="activity-panel activity-panel-instruction">
                                      <div className="activity-card-header">
                                        <div>
                                          <span className="contenido-badge">{getTipoContenidoLabel(contenido.tipo)}</span>
                                          <h4>Actividad propuesta por tu profesor</h4>
                                        </div>
                                      </div>

                                      <div className="activity-instruction">
                                        <p>{contenido.contenido}</p>
                                      </div>
                                    </div>

                                    <div className="activity-panel activity-panel-response">
                                      <div className="respuesta-form">
                                        <div className="respuesta-form-header">
                                          <div>
                                            <h5>Tu respuesta</h5>
                                            <p>Escribí tu aporte y elige quién puede verlo.</p>
                                          </div>
                                          {respuestaExistente && (
                                            <span className={`saved-pill saved-pill-${respuestaExistente.visibilidad === 'compartido' ? 'shared' : 'private'}`}>
                                              {respuestaExistente.visibilidad === 'compartido' ? '⬤ Compartida' : '⬤ Solo para mí'}
                                            </span>
                                          )}
                                        </div>

                                        <textarea
                                          id={`respuesta-${contenido.id}`}
                                          value={valorActual}
                                          onChange={(event) => handleDraftChange(contenido.id, event.target.value)}
                                          placeholder="Escribí tu respuesta aquí…"
                                          rows={6}
                                        />

                                        <div className="respuesta-actions">
                                          <label className="respuesta-select-label">
                                            <span>Visibilidad</span>
                                            <select
                                              value={visibilidadActual}
                                              onChange={(event) => handleVisibilityChange(contenido.id, event.target.value)}
                                            >
                                              <option value="privado">Solo para mí</option>
                                              <option value="compartido">Compartir respuesta</option>
                                            </select>
                                          </label>

                                          <div className="respuesta-actions-buttons">
                                            {respuestaExistente && confirmandoEliminacion === contenido.id && (
                                              <div className="respuesta-confirm-row">
                                                <span>¿Eliminar tu respuesta?</span>
                                                <button
                                                  type="button"
                                                  className="btn-confirm-text danger"
                                                  onClick={() => handleDeleteRespuesta(contenido.id)}
                                                  disabled={deletingContentId === contenido.id}
                                                >
                                                  {deletingContentId === contenido.id ? 'Eliminando…' : 'Sí, eliminar'}
                                                </button>
                                                <button
                                                  type="button"
                                                  className="btn-confirm-text cancel"
                                                  onClick={() => setConfirmandoEliminacion(null)}
                                                >
                                                  Cancelar
                                                </button>
                                              </div>
                                            )}
                                            {respuestaExistente && confirmandoEliminacion !== contenido.id && (
                                              <button
                                                type="button"
                                                className="btn-pequeño btn-danger"
                                                onClick={() => handleDeleteRespuesta(contenido.id)}
                                                disabled={deletingContentId === contenido.id}
                                              >
                                                Eliminar
                                              </button>
                                            )}
                                            {confirmandoActualizacion === contenido.id && (
                                              <div className="respuesta-confirm-row">
                                                <span>¿Reemplazar tu respuesta?</span>
                                                <button
                                                  type="button"
                                                  className="btn-confirm-text confirm"
                                                  onClick={() => handleSubmitRespuesta(contenido.id)}
                                                  disabled={submittingContentId === contenido.id}
                                                >
                                                  {submittingContentId === contenido.id ? 'Guardando…' : 'Sí, actualizar'}
                                                </button>
                                                <button
                                                  type="button"
                                                  className="btn-confirm-text cancel"
                                                  onClick={() => setConfirmandoActualizacion(null)}
                                                >
                                                  Cancelar
                                                </button>
                                              </div>
                                            )}
                                            {confirmandoActualizacion !== contenido.id && (
                                              <button
                                                type="button"
                                                className="btn-primary"
                                                onClick={() => handleSubmitRespuesta(contenido.id)}
                                                disabled={submittingContentId === contenido.id || !valorActual.trim()}
                                              >
                                                {submittingContentId === contenido.id
                                                  ? 'Guardando…'
                                                  : respuestaExistente
                                                    ? 'Actualizar respuesta'
                                                    : 'Enviar respuesta'}
                                              </button>
                                            )}
                                          </div>
                                        </div>

                                      </div>
                                    </div>

                                    <div className="activity-panel activity-panel-shared">
                                      <div className="shared-responses-card">
                                        <div className="shared-responses-header">
                                          <h4>Respuestas compartidas</h4>
                                          <span>{respuestasCompartidas.filter((item) => item?.contenido?.id === contenido.id).length}</span>
                                        </div>
                                        {respuestasCompartidas.filter((item) => item?.contenido?.id === contenido.id).length === 0 ? (
                                          <p className="shared-empty">Todavía no hay respuestas compartidas para este contenido.</p>
                                        ) : (
                                          <ul className="shared-responses-list">
                                            {respuestasCompartidas
                                              .filter((item) => item?.contenido?.id === contenido.id)
                                              .map((item) => (
                                                <li key={item.id} className="shared-response-item">
                                                  <div className="shared-response-meta">
                                                    <strong>{item.alumno?.usuario?.nombre || 'Compañero'}</strong>
                                                    <span>{formatDate(item.createdAt)}</span>
                                                  </div>
                                                  <p>{item.respuesta}</p>
                                                </li>
                                              ))}
                                          </ul>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
