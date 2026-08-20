import { useEffect, useState } from "react";
import ViajesGrid from "../components/viajes/ViajesGrid";
import { getViajes, subscribeContent } from "../services/contentService";

export default function Viajes() {
  const [viajes, setViajes] = useState(getViajes());

  useEffect(() => {
    return subscribeContent(() => setViajes(getViajes()));
  }, []);

  return <ViajesGrid viajes={viajes} />;
}
