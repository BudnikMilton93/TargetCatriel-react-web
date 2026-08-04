import { useState } from "react";

const emptyForm = {
  id: "",
  destino: "",
  fechas: "",
  duracion: "",
  nivelRecomendado: "",
  incluyeClases: true,
  precio: "",
  cupos: "",
  imagen: "",
};

export default function ViajesAdmin({ viajes, onSave }) {
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      id: form.id || `v-${Date.now()}`,
      precio: Number(form.precio),
      cupos: Number(form.cupos),
      incluyeClases: Boolean(form.incluyeClases),
    };

    const exists = viajes.some((item) => item.id === payload.id);
    const updated = exists ? viajes.map((item) => (item.id === payload.id ? payload : item)) : [payload, ...viajes];

    onSave(updated);
    setForm(emptyForm);
  };

  const handleDelete = (id) => {
    onSave(viajes.filter((item) => item.id !== id));
    if (form.id === id) {
      setForm(emptyForm);
    }
  };

  return (
    <div>
      <h2>Gestion de viajes</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <input
          required
          placeholder="Destino"
          value={form.destino}
          onChange={(event) => setForm((prev) => ({ ...prev, destino: event.target.value }))}
        />
        <input
          required
          placeholder="Fechas"
          value={form.fechas}
          onChange={(event) => setForm((prev) => ({ ...prev, fechas: event.target.value }))}
        />
        <input
          required
          placeholder="Duracion"
          value={form.duracion}
          onChange={(event) => setForm((prev) => ({ ...prev, duracion: event.target.value }))}
        />
        <input
          required
          placeholder="Nivel recomendado"
          value={form.nivelRecomendado}
          onChange={(event) => setForm((prev) => ({ ...prev, nivelRecomendado: event.target.value }))}
        />
        <label className="checkbox-row">
          <span>Incluye clases</span>
          <input
            type="checkbox"
            checked={form.incluyeClases}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, incluyeClases: event.target.checked }))
            }
          />
        </label>
        <input
          required
          type="number"
          placeholder="Precio USD"
          value={form.precio}
          onChange={(event) => setForm((prev) => ({ ...prev, precio: event.target.value }))}
        />
        <input
          required
          type="number"
          placeholder="Cupos"
          value={form.cupos}
          onChange={(event) => setForm((prev) => ({ ...prev, cupos: event.target.value }))}
        />
        <input
          required
          placeholder="URL imagen"
          value={form.imagen}
          onChange={(event) => setForm((prev) => ({ ...prev, imagen: event.target.value }))}
        />

        <div className="admin-actions">
          <button type="submit" className="btn btn-primary">
            {form.id ? "Guardar cambios" : "Crear viaje"}
          </button>
          {form.id && (
            <button type="button" className="btn btn-outline" onClick={() => setForm(emptyForm)}>
              Cancelar edicion
            </button>
          )}
        </div>
      </form>

      <div className="admin-list">
        {viajes.map((item) => (
          <article key={item.id} className="admin-item">
            <h3>{item.destino}</h3>
            <p>{item.fechas}</p>
            <p>Precio: USD {item.precio}</p>
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
