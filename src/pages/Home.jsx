import { useEffect, useState } from "react";
import Hero from "../components/home/Hero";
import ClasesOferta from "../components/home/ClasesOferta";
import AlumnoJourney from "../components/home/AlumnoJourney";
import NoticiasDestacadas from "../components/home/NoticiasDestacadas";
import GaleriaDestacada from "../components/home/GaleriaDestacada";
import { getContent, subscribeContent } from "../services/contentService";

export default function Home() {
  const [content, setContent] = useState(getContent());

  useEffect(() => {
    return subscribeContent(() => setContent(getContent()));
  }, []);

  return (
    <>
      <Hero />
      <ClasesOferta />
      <AlumnoJourney />
      <NoticiasDestacadas noticias={content.noticias} />
      <GaleriaDestacada galeria={content.galeria} />
    </>
  );
}
