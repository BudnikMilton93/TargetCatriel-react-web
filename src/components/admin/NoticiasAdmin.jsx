import { useState } from "react";

const emptyForm = {
  id: "",
  titulo: "",
  copete: "",
  cuerpo: "",
  imagen: "",
  fecha: "",
};

export default function NoticiasAdmin({ noticias, onSave }) {
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      id: form.id || `n-${Date.now()}`,
    };

    const exists = noticias.some((item) => item.id === payload.id);
    const updated = exists
      ? noticias.map((item) => (item.id === payload.id ? payload : item))
      : [payload, ...noticias];

    onSave(updated);
    setForm(emptyForm);
  };

  const handleDelete = (id) => {
    onSave(noticias.filter((item) => item.id !== id));
    if (form.id === id) {
      setForm(emptyForm);
    }
  };

  return (
    <div>
      <h2>Gestion de noticias</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <input
          required
          placeholder="Titulo"
          value={form.titulo}
          onChange={(event) => setForm((prev) => ({ ...prev, titulo: event.target.value }))}
        />
        <input
          required
          placeholder="Copete"
          value={form.copete}
          onChange={(event) => setForm((prev) => ({ ...prev, copete: event.target.value }))}
        />
        <textarea
          required
          placeholder="Cuerpo"
          value={form.cuerpo}
          onChange={(event) => setForm((prev) => ({ ...prev, cuerpo: event.target.value }))}
        />
        <input
          required
          placeholder="URL imagen"
          value={form.imagen}
          onChange={(event) => setForm((prev) => ({ ...prev, imagen: event.target.value }))}
        />
        <input
          required
          type="date"
          value={form.fecha}
          onChange={(event) => setForm((prev) => ({ ...prev, fecha: event.target.value }))}
        />

        <div className="admin-actions">
          <button type="submit" className="btn btn-primary">
            {form.id ? "Guardar cambios" : "Crear noticia"}
          </button>
          {form.id && (
            <button type="button" className="btn btn-outline" onClick={() => setForm(emptyForm)}>
              Cancelar edicion
            </button>
          )}
        </div>
      </form>

      <div className="admin-list">
        {noticias.map((item) => (
          <article key={item.id} className="admin-item">
            <h3>{item.titulo}</h3>
            <p>{item.copete}</p>
            <small>{item.fecha}</small>
            <div className="admin-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setForm(item)}>
                Editar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleDelete(item.id)}
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
