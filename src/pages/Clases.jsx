import ClasesOferta from "../components/home/ClasesOferta";
import ClasesOverview from "../components/clases/ClasesOverview";

export default function Clases() {
  return (
    <>
      <section className="section page-hero">
        <div className="container">
          <h1>Clases de ingles para todas las edades</h1>
          <p>Elegi modalidad, objetivo y ritmo de aprendizaje para avanzar con seguridad.</p>
        </div>
      </section>
      <ClasesOverview />
      <ClasesOferta />
    </>
  );
}
