import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/clases", label: "Clases" },
  { to: "/viajes", label: "Viajes" },
  { to: "/alumnos", label: "Alumnos" },
  { to: "/sobre-nosotros", label: "Sobre nosotros" },
  { to: "/contacto", label: "Contacto" },
];

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleGoToDashboard = () => {
    if (user?.roles?.includes("profesor")) {
      navigate("/dashboard/profesor");
    } else if (user?.roles?.includes("alumno")) {
      navigate("/dashboard/alumno");
    } else if (user?.roles?.includes("admin")) {
      navigate("/dashboard/admin");
    } else if (user?.roles?.includes("marketing")) {
      navigate("/dashboard/marketing");
    }
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <NavLink to="/" className="brand" aria-label="Ir al inicio">
          <img src="/Target.png" alt="Logo Target Catriel" className="brand-logo" />
          <span>
            <strong>Target Catriel</strong>
            <small>Instituto de ingles</small>
          </span>
        </NavLink>

        <nav aria-label="Navegacion principal">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-auth">
          {isAuthenticated ? (
            <>
              <span className="user-name">{user?.name}</span>
              <button onClick={handleGoToDashboard} className="btn-dashboard">
                Mi Panel
              </button>
              <button onClick={handleLogout} className="btn-logout-header">
                Cerrar sesión
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn-login-header">
              Ingresar
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

