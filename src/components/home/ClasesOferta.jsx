import { useMemo, useState } from "react";
import Card from "../shared/Card";

const cursos = [
  {
    id: "c1",
    nombre: "Kids Starter",
    nivel: "A1",
    duracion: "4 meses",
    modalidad: "presencial",
    edad: "ninos",
    objetivo: "conversacion",
  },
  {
    id: "c2",
    nombre: "Teen Challenge",
    nivel: "A2-B1",
    duracion: "5 meses",
    modalidad: "online",
    edad: "adolescentes",
    objetivo: "examen",
  },
  {
    id: "c3",
    nombre: "Adults Pro",
    nivel: "B1-B2",
    duracion: "6 meses",
    modalidad: "presencial",
    edad: "adultos",
    objetivo: "conversacion",
  },
  {
    id: "c4",
    nombre: "Travel English Lab",
    nivel: "A2+",
    duracion: "8 semanas",
    modalidad: "online",
    edad: "adultos",
    objetivo: "viaje",
  },
  {
    id: "c5",
    nombre: "FCE Intensive",
    nivel: "B2",
    duracion: "12 semanas",
    modalidad: "online",
    edad: "adolescentes",
    objetivo: "examen",
  },
];

const proximosInicios = [
  "05 Agosto - Kids Starter",
  "12 Agosto - Adults Pro",
  "20 Agosto - FCE Intensive",
];

export default function ClasesOferta() {
  const [filtros, setFiltros] = useState({ modalidad: "todos", edad: "todos", objetivo: "todos" });

  const cursosFiltrados = useMemo(() => {
    return cursos.filter((curso) => {
      const modalidadOk = filtros.modalidad === "todos" || curso.modalidad === filtros.modalidad;
      const edadOk = filtros.edad === "todos" || curso.edad === filtros.edad;
      const objetivoOk = filtros.objetivo === "todos" || curso.objetivo === filtros.objetivo;
      return modalidadOk && edadOk && objetivoOk;
    });
  }, [filtros]);

  return (
    <section className="section section-alt">
      <div className="container">
        <h2>Oferta de clases</h2>

        <div className="filters-grid">
          <label>
            Modalidad
            <select
              value={filtros.modalidad}
              onChange={(event) => setFiltros((prev) => ({ ...prev, modalidad: event.target.value }))}
            >
              <option value="todos">Todas</option>
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
            </select>
          </label>

          <label>
            Edad
            <select
              value={filtros.edad}
              onChange={(event) => setFiltros((prev) => ({ ...prev, edad: event.target.value }))}
            >
              <option value="todos">Todas</option>
              <option value="ninos">Ninos</option>
              <option value="adolescentes">Adolescentes</option>
              <option value="adultos">Adultos</option>
            </select>
          </label>

          <label>
            Objetivo
            <select
              value={filtros.objetivo}
              onChange={(event) => setFiltros((prev) => ({ ...prev, objetivo: event.target.value }))}
            >
              <option value="todos">Todos</option>
              <option value="conversacion">Conversacion</option>
              <option value="examen">Examen internacional</option>
              <option value="viaje">Viaje</option>
            </select>
          </label>
        </div>

        <div className="cards-grid">
          {cursosFiltrados.map((curso) => (
            <Card key={curso.id}>
              <h3>{curso.nombre}</h3>
              <p>Nivel: {curso.nivel}</p>
              <p>Duracion: {curso.duracion}</p>
              <p>Modalidad: {curso.modalidad}</p>
              <button type="button" className="btn btn-secondary">
                Mas info
              </button>
            </Card>
          ))}
        </div>

        <div className="start-list">
          <h3>Proximos inicios</h3>
          <ul>
            {proximosInicios.map((inicio) => (
              <li key={inicio}>{inicio}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
