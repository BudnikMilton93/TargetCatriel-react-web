import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/login.css';

export default function Login() {
  const [email, setEmail] = useState('profesor@target.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Redirigir según rol
      if (user.roles.includes('profesor')) {
        navigate('/dashboard/profesor');
      } else if (user.roles.includes('alumno')) {
        navigate('/dashboard/alumno');
      } else if (user.roles.includes('admin')) {
        navigate('/dashboard/admin');
      } else if (user.roles.includes('marketing')) {
        navigate('/dashboard/marketing');
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
            <li><strong>Profesor:</strong> profesor@target.com</li>
            <li><strong>Alumno:</strong> alumno@target.com</li>
            <li><strong>Admin:</strong> admin@target.com</li>
            <li><strong>Marketing:</strong> marketing@target.com</li>
          </ul>
          <p className="text-xs">Cualquier contraseña funciona</p>
        </div>
      </div>
    </div>
  );
}
