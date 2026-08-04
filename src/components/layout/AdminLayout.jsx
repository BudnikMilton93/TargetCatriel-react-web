const sections = [
  { key: "noticias", label: "Noticias" },
  { key: "viajes", label: "Viajes" },
  { key: "galeria", label: "Galeria" },
  { key: "sobreNosotros", label: "Sobre nosotros" },
];

export default function AdminLayout({ activeSection, onChangeSection, onLogout, children }) {
  return (
    <section className="admin-panel container">
      <div className="admin-panel-header">
        <h1>Panel de administracion</h1>
        <button type="button" className="btn btn-outline" onClick={onLogout}>
          Cerrar sesion
        </button>
      </div>

      <div className="admin-tabs" role="tablist" aria-label="Secciones de contenido">
        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            className={`tab ${activeSection === section.key ? "tab-active" : ""}`}
            onClick={() => onChangeSection(section.key)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="admin-content">{children}</div>
    </section>
  );
}
