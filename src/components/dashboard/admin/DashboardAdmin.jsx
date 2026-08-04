import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/pages/dashboard.css';

export default function DashboardAdmin() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('profesores');
  const [profesores] = useState([
    { id: 1, nombre: 'Juan Profesor', bloques: 2, alumnos: 27, email: 'juan@target.com' },
    { id: 2, nombre: 'María Docente', bloques: 1, alumnos: 15, email: 'maria@target.com' },
  ]);
  const [alumnos] = useState([
    { id: 1, nombre: 'Pedro Alumno', email: 'pedro@mail.com', bloque: 'A1 - Lun/Mié', progreso: 45, asistencia: 80 },
    { id: 2, nombre: 'Sofia Estudiante', email: 'sofia@mail.com', bloque: 'A2 - Mar/Jue', progreso: 72, asistencia: 95 },
    { id: 3, nombre: 'Lucas Aprendiz', email: 'lucas@mail.com', bloque: 'B1 - Lun/Mié', progreso: 58, asistencia: 85 },
  ]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Panel Administrativo</h1>
          <p>Bienvenido Admin, {user?.name}</p>
        </div>
        <button onClick={logout} className="btn-logout">Cerrar sesión</button>
      </header>

      <div className="dashboard-content">
        <div className="tabs-navigation">
          <button 
            className={`tab ${tab === 'profesores' ? 'active' : ''}`}
            onClick={() => setTab('profesores')}
          >
            Profesores
          </button>
          <button 
            className={`tab ${tab === 'alumnos' ? 'active' : ''}`}
            onClick={() => setTab('alumnos')}
          >
            Alumnos
          </button>
          <button 
            className={`tab ${tab === 'bloques' ? 'active' : ''}`}
            onClick={() => setTab('bloques')}
          >
            Bloques
          </button>
        </div>

        {tab === 'profesores' && (
          <section className="section-lista">
            <h2>Gestión de Profesores</h2>
            <table className="tabla-admin">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Bloques</th>
                  <th>Alumnos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {profesores.map(prof => (
                  <tr key={prof.id}>
                    <td>{prof.nombre}</td>
                    <td>{prof.email}</td>
                    <td>{prof.bloques}</td>
                    <td>{prof.alumnos}</td>
                    <td>
                      <button className="btn-pequeño">Ver</button>
                      <button className="btn-pequeño">Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {tab === 'alumnos' && (
          <section className="section-lista">
            <h2>Listado de Alumnos</h2>
            <table className="tabla-admin">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Bloque</th>
                  <th>Progreso</th>
                  <th>Asistencia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map(alumno => (
                  <tr key={alumno.id}>
                    <td>{alumno.nombre}</td>
                    <td>{alumno.email}</td>
                    <td>{alumno.bloque}</td>
                    <td>
                      <div className="progress-bar-small">
                        <div className="progress-fill" style={{ width: `${alumno.progreso}%` }}></div>
                      </div>
                      {alumno.progreso}%
                    </td>
                    <td>{alumno.asistencia}%</td>
                    <td>
                      <button className="btn-pequeño">Ver Detalle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {tab === 'bloques' && (
          <section className="section-lista">
            <h2>Todos los Bloques</h2>
            <p>Administración de bloques académicos...</p>
          </section>
        )}
      </div>
    </div>
  );
}
