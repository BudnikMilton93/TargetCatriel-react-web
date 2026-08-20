import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getContent,
  resetContent,
  setGaleria,
  setNoticias,
  setSobreNosotros,
  setViajes,
  subscribeContent,
} from '../services/contentService';

/**
 * Hook para manejar el estado y la lógica del dashboard de Marketing
 */
export function useMarketing() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('noticias');
  const [content, setContent] = useState(() => getContent());
  const displayName = user?.nombre || user?.name || 'Marketing';

  useEffect(() => subscribeContent(() => setContent(getContent())), []);

  const syncContent = () => setContent(getContent());

  const handleSaveNoticias = (noticias) => {
    setNoticias(noticias);
    syncContent();
  };

  const handleSaveViajes = (viajes) => {
    setViajes(viajes);
    syncContent();
  };

  const handleSaveGaleria = (galeria) => {
    setGaleria(galeria);
    syncContent();
  };

  const handleSaveSobreNosotros = (sobreNosotros) => {
    setSobreNosotros(sobreNosotros);
    syncContent();
  };

  const handleReset = () => {
    resetContent();
    syncContent();
  };

  const sections = [
    {
      key: 'noticias',
      label: 'Noticias',
      count: content.noticias.length,
      detail: 'Se muestran en la portada.',
    },
    {
      key: 'viajes',
      label: 'Viajes',
      count: content.viajes.length,
      detail: 'Impacta la página pública de viajes.',
    },
    {
      key: 'galeria',
      label: 'Galería',
      count: content.galeria.length,
      detail: 'La landing destaca los primeros 6 recursos.',
    },
    {
      key: 'sobreNosotros',
      label: 'Sobre Nosotros',
      count: content.sobreNosotros.imagenes.length,
      detail: 'Edita la narrativa institucional pública.',
    },
  ];

  return {
    displayName,
    logout,
    tab,
    setTab,
    content,
    sections,
    handleSaveNoticias,
    handleSaveViajes,
    handleSaveGaleria,
    handleSaveSobreNosotros,
    handleReset,
  };
}
