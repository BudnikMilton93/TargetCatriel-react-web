import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/pages/dashboard.css';

export default function DashboardAlumno() {
  const { user, logout } = useAuth();
  const [bloque] = useState({
    id: 1,
    nombre: 'A1 - Lunes y Miércoles - 16:00 a 17:00 hs',
    profesor: 'Juan Profesor',
    nivel: 'A1',
    progreso: 65,
  });
  const [modulos] = useState([
    { id: 1, titulo: 'Módulo 1 - Presentación Personal', fecha: '2026-08-04', completado: true },
    { id: 2, titulo: 'Módulo 2 - Familia y Relaciones', fecha: '2026-08-06', completado: false },
    { id: 3, titulo: 'Módulo 3 - Vida Cotidiana', fecha: '2026-08-11', completado: false, activo: true },
  ]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Mi Espacio de Aprendizaje</h1>
          <p>Bienvenido, {user?.name}</p>
        </div>
        <button onClick={logout} className="btn-logout">Cerrar sesión</button>
      </header>

      <div className="dashboard-content">
        <section className="section-bloque-info">
          <div className="bloque-info-card">
            <h2>{bloque.nombre}</h2>
            <p><strong>Profesor:</strong> {bloque.profesor}</p>
            <p><strong>Nivel:</strong> {bloque.nivel}</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${bloque.progreso}%` }}></div>
            </div>
            <p className="progress-text">Progreso: {bloque.progreso}%</p>
          </div>
        </section>

        <section className="section-modulos">
          <h2>Mis Módulos</h2>
          <div className="modulos-list">
            {modulos.map(modulo => (
              <div key={modulo.id} className={`modulo-card ${modulo.activo ? 'activo' : ''} ${modulo.completado ? 'completado' : ''}`}>
                <div className="modulo-header">
                  <h3>{modulo.titulo}</h3>
                  <span className="fecha">{modulo.fecha}</span>
                </div>
                {modulo.completado && <span className="badge-completado">✓ Completado</span>}
                {modulo.activo && <span className="badge-activo">Activo</span>}
                <button className="btn-secondary">Ver Módulo</button>
              </div>
            ))}
          </div>
        </section>

        <section className="section-recursos">
          <h2>Recursos del Bloque</h2>
          <div className="recursos-list">
            <div className="recurso-item">
              <span>📄 Libro de Texto: English Today A1</span>
              <button className="btn-secondary">Descargar</button>
            </div>
            <div className="recurso-item">
              <span>🎵 Audios de Pronunciación</span>
              <button className="btn-secondary">Ver</button>
            </div>
            <div className="recurso-item">
              <span>📝 Vocabulario Referencia</span>
              <button className="btn-secondary">Ver</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
