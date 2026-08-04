import { useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import NoticiasAdmin from "../components/admin/NoticiasAdmin";
import ViajesAdmin from "../components/admin/ViajesAdmin";
import GaleriaAdmin from "../components/admin/GaleriaAdmin";
import SobreNosotrosAdmin from "../components/admin/SobreNosotrosAdmin";
import {
  getContent,
  setNoticias,
  setViajes,
  setGaleria,
  setSobreNosotros,
  resetContent,
} from "../services/contentService";

const AUTH_KEY = "admin-auth";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(AUTH_KEY) === "true"
  );
  const [activeSection, setActiveSection] = useState("noticias");
  const [content, setContent] = useState(getContent());

  const handleLogin = (event) => {
    event.preventDefault();
    sessionStorage.setItem(AUTH_KEY, "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  const syncContent = () => setContent(getContent());

  const saveNoticias = (noticias) => {
    setNoticias(noticias);
    syncContent();
  };

  const saveViajes = (viajes) => {
    setViajes(viajes);
    syncContent();
  };

  const saveGaleria = (galeria) => {
    setGaleria(galeria);
    syncContent();
  };

  const saveSobreNosotros = (sobreNosotros) => {
    setSobreNosotros(sobreNosotros);
    syncContent();
  };

  const handleReset = () => {
    resetContent();
    syncContent();
  };

  if (!isAuthenticated) {
    return (
      <section className="section">
        <div className="container auth-box">
          <h1>Acceso admin</h1>
          <p>Login simulado para demostrar el flujo de gestion de contenido.</p>
          <form onSubmit={handleLogin} className="admin-form">
            <input type="email" placeholder="Email" required defaultValue="admin@targetcatriel.edu" />
            <input type="password" placeholder="Contrasena" required defaultValue="123456" />
            <button className="btn btn-primary" type="submit">
              Ingresar
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="section section-alt">
        <div className="container admin-top-actions">
          <button type="button" className="btn btn-outline" onClick={handleReset}>
            Restaurar datos de ejemplo
          </button>
        </div>
      </section>
      <AdminLayout
        activeSection={activeSection}
        onChangeSection={setActiveSection}
        onLogout={handleLogout}
      >
        {activeSection === "noticias" && (
          <NoticiasAdmin noticias={content.noticias} onSave={saveNoticias} />
        )}
        {activeSection === "viajes" && <ViajesAdmin viajes={content.viajes} onSave={saveViajes} />}
        {activeSection === "galeria" && (
          <GaleriaAdmin galeria={content.galeria} onSave={saveGaleria} />
        )}
        {activeSection === "sobreNosotros" && (
          <SobreNosotrosAdmin
            sobreNosotros={content.sobreNosotros}
            onSave={saveSobreNosotros}
          />
        )}
      </AdminLayout>
    </>
  );
}
