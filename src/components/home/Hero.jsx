import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="hero section">
      <div className="container hero-grid">
        <div>
          <p className="eyebrow">Para el instituto</p>
          <h1>Ingles para crecer: estudiar, certificar y viajar con confianza</h1>
          <p>
            Acompanamos a cada alumno desde su test de nivel hasta su proxima meta academica o
            experiencia internacional.
          </p>
          <div className="hero-actions">
            <Link to="/clases" className="btn btn-primary">
              Conoce nuestros cursos
            </Link>
            <Link to="/alumnos" className="btn btn-outline">
              Hace el test de nivel
            </Link>
          </div>
        </div>
        <div className="hero-metrics">
          <article>
            <strong>15+</strong>
            <span>Anos de trayectoria</span>
          </article>
          <article>
            <strong>2800+</strong>
            <span>Alumnos formados</span>
          </article>
          <article>
            <strong>4</strong>
            <span>Certificaciones internacionales</span>
          </article>
        </div>
      </div>
    </section>
  );
}
