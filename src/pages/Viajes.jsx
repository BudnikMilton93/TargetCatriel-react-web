import { useEffect, useState } from "react";
import ViajesGrid from "../components/viajes/ViajesGrid";
import { getViajes } from "../services/contentService";

export default function Viajes() {
  const [viajes, setViajes] = useState(getViajes());

  useEffect(() => {
    const onStorage = () => setViajes(getViajes());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <ViajesGrid viajes={viajes} />;
}
