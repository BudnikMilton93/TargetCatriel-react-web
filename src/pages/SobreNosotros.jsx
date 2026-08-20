import { useEffect, useState } from "react";
import { getSobreNosotros, subscribeContent } from "../services/contentService";

export default function SobreNosotros() {
  const [sobreNosotros, setSobreNosotros] = useState(getSobreNosotros());

  useEffect(() => {
    return subscribeContent(() => setSobreNosotros(getSobreNosotros()));
  }, []);

  return (
    <section className="section">
      <div className="container about-grid">
        <div>
          <p className="eyebrow">Sobre nosotros</p>
          <h1>{sobreNosotros.titulo}</h1>
          <p>{sobreNosotros.historia}</p>
          <p>{sobreNosotros.docentes}</p>
        </div>
        <div className="about-images">
          {sobreNosotros.imagenes.map((image) => (
            <img key={image} src={image} alt="Equipo y comunidad del instituto" />
          ))}
        </div>
      </div>
    </section>
  );
}
