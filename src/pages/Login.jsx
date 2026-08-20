import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/login.css';

const dashboardRouteByRole = {
  profesor: '/dashboard/profesor',
  alumno: '/dashboard/alumno',
  marketing: '/dashboard/marketing',
  admin: '/dashboard/admin',
  administrador: '/dashboard/admin',
};

export default function Login() {
  const [email, setEmail] = useState('maria@target.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, resolveDashboardPath } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      const availableDashboardPaths = [...new Set(
        (user.roles || [])
          .map((role) => dashboardRouteByRole[role])
          .filter(Boolean)
      )];

      const dashboardPath = resolveDashboardPath() || availableDashboardPaths[0] || null;

      if (availableDashboardPaths.length === 1 && dashboardPath) {
        navigate(dashboardPath);
      } else if (availableDashboardPaths.length > 1) {
        navigate('/seleccionar-panel');
      } else if (dashboardPath) {
        navigate(dashboardPath);
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Target - Escuela de Inglés</h1>
        <p className="tagline">Un paso adelante · Desde 1994</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="demo-users">
          <p className="text-sm">🔑 Usuarios de prueba:</p>
          <ul className="text-xs">
            <li><strong>Profesor:</strong> maria@target.com</li>
            <li><strong>Alumno:</strong> juan@student.com</li>
            <li><strong>Admin:</strong> admin@target.com</li>
            <li><strong>Marketing:</strong> marketing@target.com</li>
          </ul>
          <p className="text-xs">Cualquier contraseña funciona</p>
        </div>
      </div>
    </div>
  );
}
