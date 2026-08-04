import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/pages/dashboard.css';

export default function DashboardProfesor() {
  const { user, logout } = useAuth();
  const [bloques, setBloques] = useState([
    { id: 1, nombre: 'A1 - Lunes y Miércoles - 16:00 a 17:00 hs', alumnos: 15, modulos: 8, nivel: 'A1', anio: 2026 },
    { id: 2, nombre: 'A2 - Martes y Jueves - 17:30 a 18:30 hs', alumnos: 12, modulos: 6, nivel: 'A2', anio: 2026 },
  ]);
  const [selectedBloque, setSelectedBloque] = useState(null);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard Profesor</h1>
          <p>Bienvenido, {user?.name}</p>
        </div>
        <button onClick={logout} className="btn-logout">Cerrar sesión</button>
      </header>

      <div className="dashboard-content">
        <section className="section-bloques">
          <div className="section-header">
            <h2>Mis Bloques</h2>
            <button className="btn-primary">+ Crear Bloque</button>
          </div>

          <div className="bloques-grid">
            {bloques.map(bloque => (
              <div 
                key={bloque.id} 
                className="bloque-card"
                onClick={() => setSelectedBloque(bloque)}
              >
                <h3>{bloque.nombre}</h3>
                <div className="bloque-stats">
                  <span>👥 {bloque.alumnos} alumnos</span>
                  <span>📚 {bloque.modulos} módulos</span>
                </div>
                <div className="bloque-actions">
                  <button className="btn-secondary">Ver Detalle</button>
                  <button className="btn-secondary">Editar</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedBloque && (
          <section className="section-detalle">
            <h2>{selectedBloque.nombre}</h2>
            <tabs>
              <button className="tab active">Módulos</button>
              <button className="tab">Alumnos</button>
              <button className="tab">Recursos</button>
              <button className="tab">Asistencia</button>
            </tabs>
            <div className="tab-content">
              <button className="btn-primary">+ Crear Módulo</button>
              <button className="btn-secondary">Crear Módulos Masivo</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
