import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/login.css';

const roleDescriptions = {
  profesor: 'Gestionar bloques, módulos y seguimiento académico.',
  alumno: 'Continuar tu recorrido, ver clases y avances.',
  marketing: 'Editar el contenido público que se muestra en la landing.',
  admin: 'Administrar la operación general del instituto.',
};

export default function SeleccionarPanel() {
  const navigate = useNavigate();
  const { dashboardOptions, resolveDashboardPath, setActiveDashboardRole } = useAuth();

  useEffect(() => {
    const dashboardPath = resolveDashboardPath();

    if (dashboardPath) {
      navigate(dashboardPath, { replace: true });
    }
  }, [navigate, resolveDashboardPath]);

  const handleSelectRole = (role) => {
    const updated = setActiveDashboardRole(role);
    const selectedOption = dashboardOptions.find((option) => option.key === role);

    if (updated && selectedOption) {
      navigate(selectedOption.route, { replace: true });
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Elegí tu panel</h1>
        <p className="tagline">
          Tu usuario tiene más de una responsabilidad. Elegí con qué perfil querés continuar.
        </p>

        <div className="role-selector-list">
          {dashboardOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              className="role-selector-button"
              onClick={() => handleSelectRole(option.key)}
            >
              <strong>{option.label}</strong>
              <span>{roleDescriptions[option.key] || 'Abrir este panel de trabajo.'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}