const pasos = [
  "Test de nivel",
  "Plan de estudio personalizado",
  "Curso y seguimiento docente",
  "Certificacion",
  "Viaje educativo/turistico",
];

const testimonios = [
  {
    id: "t1",
    nombre: "Sofia M.",
    texto: "Pase de un A2 inseguro a rendir FCE con confianza. El acompanamiento fue clave.",
  },
  {
    id: "t2",
    nombre: "Lucas P.",
    texto: "Hice curso y viaje en combo. Practique ingles real todos los dias.",
  },
];

export default function AlumnoJourney() {
  return (
    <section className="section" id="journey">
      <div className="container">
        <h2>Experiencia del alumno</h2>
        <div className="journey-grid">
          <ol>
            {pasos.map((paso) => (
              <li key={paso}>{paso}</li>
            ))}
          </ol>
          <div className="testimonials">
            {testimonios.map((item) => (
              <blockquote key={item.id}>
                <p>{item.texto}</p>
                <cite>{item.nombre}</cite>
              </blockquote>
            ))}
          </div>
        </div>

        <a className="btn btn-primary" href="mailto:testdenivel@targetcatriel.edu">
          Solicitar test de nivel
        </a>
      </div>
    </section>
  );
}
