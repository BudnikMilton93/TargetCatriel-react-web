import Card from "../shared/Card";

export default function NoticiasDestacadas({ noticias }) {
  return (
    <section className="section section-alt">
      <div className="container">
        <div className="section-heading">
          <h2>Noticias destacadas</h2>
        </div>
        <div className="cards-grid">
          {noticias.slice(0, 3).map((item) => (
            <Card key={item.id}>
              <img src={item.imagen} alt={item.titulo} className="card-image" />
              <p className="card-date">{item.fecha}</p>
              <h3>{item.titulo}</h3>
              <p>{item.copete}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
