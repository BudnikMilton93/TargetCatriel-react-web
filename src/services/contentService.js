import initialContent from "../data/content.json";

const STORAGE_KEY = "instituto-ingles-content";

const clone = (value) => JSON.parse(JSON.stringify(value));

const loadContent = () => {
  const persisted = localStorage.getItem(STORAGE_KEY);
  if (!persisted) {
    return clone(initialContent);
  }

  try {
    return JSON.parse(persisted);
  } catch (error) {
    console.error("No se pudo leer el contenido persistido:", error);
    return clone(initialContent);
  }
};

const saveContent = (content) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
};

export const getContent = () => loadContent();

export const resetContent = () => {
  const fresh = clone(initialContent);
  saveContent(fresh);
  return fresh;
};

export const getNoticias = () => loadContent().noticias;

export const setNoticias = (noticias) => {
  const content = loadContent();
  const updated = { ...content, noticias };
  saveContent(updated);
  return updated.noticias;
};

export const getViajes = () => loadContent().viajes;

export const setViajes = (viajes) => {
  const content = loadContent();
  const updated = { ...content, viajes };
  saveContent(updated);
  return updated.viajes;
};

export const getGaleria = () => loadContent().galeria;

export const setGaleria = (galeria) => {
  const content = loadContent();
  const updated = { ...content, galeria };
  saveContent(updated);
  return updated.galeria;
};

export const getSobreNosotros = () => loadContent().sobreNosotros;

export const setSobreNosotros = (sobreNosotros) => {
  const content = loadContent();
  const updated = { ...content, sobreNosotros };
  saveContent(updated);
  return updated.sobreNosotros;
};
