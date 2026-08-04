export default function GaleriaDestacada({ galeria }) {
  return (
    <section className="section">
      <div className="container">
        <h2>Galeria destacada</h2>
        <div className="gallery-grid">
          {galeria.slice(0, 6).map((item) => (
            <figure key={item.id} className="gallery-item">
              {item.tipo === "imagen" ? (
                <img src={item.url} alt={item.titulo} />
              ) : (
                <a href={item.url} target="_blank" rel="noreferrer" className="video-link">
                  Ver video: {item.titulo}
                </a>
              )}
              <figcaption>{item.titulo}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
