import { useState } from "react";

const emptyForm = {
  id: "",
  tipo: "imagen",
  titulo: "",
  url: "",
};

export default function GaleriaAdmin({ galeria, onSave }) {
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      id: form.id || `g-${Date.now()}`,
    };

    const exists = galeria.some((item) => item.id === payload.id);
    const updated = exists ? galeria.map((item) => (item.id === payload.id ? payload : item)) : [payload, ...galeria];

    onSave(updated);
    setForm(emptyForm);
  };

  const moveItem = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= galeria.length) return;

    const reordered = [...galeria];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    onSave(reordered);
  };

  return (
    <div>
      <h2>Gestion de galeria</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <select
          value={form.tipo}
          onChange={(event) => setForm((prev) => ({ ...prev, tipo: event.target.value }))}
        >
          <option value="imagen">Imagen</option>
          <option value="video">Video</option>
        </select>
        <input
          required
          placeholder="Titulo"
          value={form.titulo}
          onChange={(event) => setForm((prev) => ({ ...prev, titulo: event.target.value }))}
        />
        <input
          required
          placeholder="URL"
          value={form.url}
          onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
        />

        <div className="admin-actions">
          <button type="submit" className="btn btn-primary">
            {form.id ? "Guardar cambios" : "Agregar recurso"}
          </button>
          {form.id && (
            <button type="button" className="btn btn-outline" onClick={() => setForm(emptyForm)}>
              Cancelar edicion
            </button>
          )}
        </div>
      </form>

      <div className="admin-list">
        {galeria.map((item, index) => (
          <article key={item.id} className="admin-item">
            <h3>{item.titulo}</h3>
            <p>{item.tipo.toUpperCase()}</p>
            <a href={item.url} target="_blank" rel="noreferrer">
              Abrir recurso
            </a>
            <div className="admin-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setForm(item)}>
                Editar
              </button>
              <button type="button" className="btn btn-outline" onClick={() => moveItem(index, -1)}>
                Subir
              </button>
              <button type="button" className="btn btn-outline" onClick={() => moveItem(index, 1)}>
                Bajar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => onSave(galeria.filter((entry) => entry.id !== item.id))}
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
