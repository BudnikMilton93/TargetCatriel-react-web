import { useMarketing } from '../../../hooks/useMarketing';
import GaleriaAdmin from '../../admin/GaleriaAdmin';
import NoticiasAdmin from '../../admin/NoticiasAdmin';
import SobreNosotrosAdmin from '../../admin/SobreNosotrosAdmin';
import ViajesAdmin from '../../admin/ViajesAdmin';
import '../../../styles/pages/dashboard.css';

export default function DashboardMarketing() {
  const {
    displayName,
    logout,
    tab,
    setTab,
    content,
    sections,
    handleSaveNoticias,
    handleSaveViajes,
    handleSaveGaleria,
    handleSaveSobreNosotros,
    handleReset,
  } = useMarketing();
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <img src="/Target.png" alt="Target Catriel" className="dashboard-header-logo" />
          <div className="dashboard-header-text">
            <span className="dashboard-header-brand">Marketing Portal</span>
            <span className="dashboard-header-greeting">Hello, {displayName}</span>
          </div>
        </div>
        <button onClick={logout} className="btn-logout">
          Sign out
        </button>
      </header>

      <div className="dashboard-content">
        <section className="section-bloque-info">
          <div className="bloque-info-card">
            <div className="bloque-info-header">
              <div>
                <h2>Contenido conectado al sitio público</h2>
                <p className="bloque-info-subtitle">
                  Noticias y galería alimentan la home. Viajes y Sobre Nosotros actualizan sus
                  páginas públicas usando la misma fuente de datos.
                </p>
              </div>
              <div className="section-header-actions">
                <a href="/" className="btn-secondary">
                  Ver landing
                </a>
                <button onClick={handleReset} className="btn-primary">
                  Restaurar demo
                </button>
              </div>
            </div>

            <div className="stats-row marketing-impact-row">
              <span className="stat-chip">Home: noticias destacadas + galería</span>
              <span className="stat-chip">Viajes: catálogo público</span>
              <span className="stat-chip">Institucional: sobre nosotros</span>
            </div>
          </div>
        </section>

        <section className="marketing-summary-grid">
          {sections.map((section) => (
            <article key={section.key} className="marketing-summary-card">
              <p className="marketing-summary-label">{section.label}</p>
              <strong className="marketing-summary-count">{section.count}</strong>
              <p className="marketing-summary-detail">{section.detail}</p>
            </article>
          ))}
        </section>

        <section className="section-bloques">
          <div className="section-header">
            <div>
              <h2>Gestión de contenido</h2>
              <span className="section-caption">
                Editá el contenido visible para alumnos, familias y visitantes.
              </span>
            </div>
          </div>

          <div className="tabs-navigation">
          <button
            className={`tab ${tab === 'noticias' ? 'active' : ''}`}
            onClick={() => setTab('noticias')}
          >
            Noticias
          </button>
          <button
            className={`tab ${tab === 'viajes' ? 'active' : ''}`}
            onClick={() => setTab('viajes')}
          >
            Viajes
          </button>
          <button
            className={`tab ${tab === 'galeria' ? 'active' : ''}`}
            onClick={() => setTab('galeria')}
          >
            Galería
          </button>
          <button
            className={`tab ${tab === 'sobreNosotros' ? 'active' : ''}`}
            onClick={() => setTab('sobreNosotros')}
          >
            Sobre Nosotros
          </button>
          </div>

          {tab === 'noticias' && (
            <section className="section-marketing">
              <NoticiasAdmin noticias={content.noticias} onSave={handleSaveNoticias} />
            </section>
          )}

          {tab === 'viajes' && (
            <section className="section-marketing">
              <ViajesAdmin viajes={content.viajes} onSave={handleSaveViajes} />
            </section>
          )}

          {tab === 'galeria' && (
            <section className="section-marketing">
              <GaleriaAdmin galeria={content.galeria} onSave={handleSaveGaleria} />
            </section>
          )}

          {tab === 'sobreNosotros' && (
            <section className="section-marketing">
              <SobreNosotrosAdmin
                sobreNosotros={content.sobreNosotros}
                onSave={handleSaveSobreNosotros}
              />
            </section>
          )}
        </section>
      </div>
    </div>
  );
}
