import Card from "../shared/Card";

export default function ViajesGrid({ viajes }) {
  return (
    <section className="section">
      <div className="container">
        <h1>Viajes educativos y turisticos en combo</h1>
        <div className="cards-grid">
          {viajes.map((viaje) => (
            <Card key={viaje.id}>
              <img src={viaje.imagen} alt={viaje.destino} className="card-image" />
              <h3>{viaje.destino}</h3>
              <p>{viaje.fechas}</p>
              <p>Duracion: {viaje.duracion}</p>
              <p>Nivel recomendado: {viaje.nivelRecomendado}</p>
              <p>{viaje.incluyeClases ? "Incluye clases" : "No incluye clases"}</p>
              <p>Precio: USD {viaje.precio}</p>
              <p>Cupos: {viaje.cupos}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
