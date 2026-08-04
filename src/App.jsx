import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import RoleGuard from "./components/shared/RoleGuard";

// Páginas públicas
import Home from "./pages/Home";
import Clases from "./pages/Clases";
import Viajes from "./pages/Viajes";
import Alumnos from "./pages/Alumnos";
import SobreNosotros from "./pages/SobreNosotros";
import Contacto from "./pages/Contacto";
import Login from "./pages/Login";

// Dashboards
import DashboardProfesor from "./components/dashboard/profesor/DashboardProfesor";
import DashboardAlumno from "./components/dashboard/alumno/DashboardAlumno";
import DashboardAdmin from "./components/dashboard/admin/DashboardAdmin";
import DashboardMarketing from "./components/dashboard/marketing/DashboardMarketing";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Header y Footer solo en rutas públicas */}
      {!isAuthenticated || window.location.pathname === "/" ? <Header /> : null}
      
      <main>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/clases" element={<Clases />} />
          <Route path="/viajes" element={<Viajes />} />
          <Route path="/alumnos" element={<Alumnos />} />
          <Route path="/sobre-nosotros" element={<SobreNosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas Privadas - Dashboard Profesor */}
          <Route 
            path="/dashboard/profesor" 
            element={
              <RoleGuard requiredRoles={['profesor']}>
                <DashboardProfesor />
              </RoleGuard>
            } 
          />

          {/* Rutas Privadas - Dashboard Alumno */}
          <Route 
            path="/dashboard/alumno" 
            element={
              <RoleGuard requiredRoles={['alumno']}>
                <DashboardAlumno />
              </RoleGuard>
            } 
          />

          {/* Rutas Privadas - Dashboard Admin */}
          <Route 
            path="/dashboard/admin" 
            element={
              <RoleGuard requiredRoles={['admin']}>
                <DashboardAdmin />
              </RoleGuard>
            } 
          />

          {/* Rutas Privadas - Dashboard Marketing */}
          <Route 
            path="/dashboard/marketing" 
            element={
              <RoleGuard requiredRoles={['marketing']}>
                <DashboardMarketing />
              </RoleGuard>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer solo en rutas públicas */}
      {!isAuthenticated || window.location.pathname === "/" ? <Footer /> : null}
    </>
  );
}

export default App;
