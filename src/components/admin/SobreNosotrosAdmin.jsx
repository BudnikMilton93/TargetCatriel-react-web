export default function SobreNosotrosAdmin({ sobreNosotros, onSave }) {
  const formKey = `${sobreNosotros.titulo}-${sobreNosotros.imagenes.length}`;

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const titulo = String(formData.get("titulo") || "").trim();
    const historia = String(formData.get("historia") || "").trim();
    const docentes = String(formData.get("docentes") || "").trim();
    const imagenesText = String(formData.get("imagenesText") || "");

    onSave({
      titulo,
      historia,
      docentes,
      imagenes: imagenesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    });
  };

  return (
    <div>
      <h2>Gestion de sobre nosotros</h2>
      <form key={formKey} className="admin-form" onSubmit={handleSubmit}>
        <input
          name="titulo"
          required
          placeholder="Titulo institucional"
          defaultValue={sobreNosotros.titulo}
        />
        <textarea
          name="historia"
          required
          placeholder="Historia"
          defaultValue={sobreNosotros.historia}
        />
        <textarea
          name="docentes"
          required
          placeholder="Docentes"
          defaultValue={sobreNosotros.docentes}
        />
        <textarea
          name="imagenesText"
          required
          placeholder="Una URL de imagen por linea"
          defaultValue={sobreNosotros.imagenes.join("\n")}
        />
        <button type="submit" className="btn btn-primary">
          Guardar contenido
        </button>
      </form>
    </div>
  );
}
