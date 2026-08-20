import { useState, useEffect } from 'react';
import '../../styles/components/modal.css';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function parseDias(diasStr) {
  if (!diasStr) return [];
  return diasStr.split(',').map((d) => d.trim()).filter((d) => DIAS_SEMANA.includes(d));
}

// Convierte una fecha a formato "YYYY-MM-DDTHH:mm" en hora LOCAL (no UTC),
// que es lo que espera un input datetime-local. Usar toISOString() aca
// desplaza el horario segun el offset de zona horaria del navegador.
function toLocalDatetimeInputValue(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BloqueModal({ isOpen, bloque, onClose, onSave, loading }) {
  const [formData, setFormData] = useState({
    nivel: '',
    dias: '',
    horaInicio: '',
    horaFin: '',
    anio: new Date().getFullYear(),
  });

  const diasSeleccionados = parseDias(formData.dias);

  const handleToggleDia = (dia) => {
    const actuales = parseDias(formData.dias);
    const nuevos = actuales.includes(dia)
      ? actuales.filter((d) => d !== dia)
      : [...actuales, dia];
    // Mantener el orden de la semana
    const ordenados = DIAS_SEMANA.filter((d) => nuevos.includes(d));
    setFormData((prev) => ({ ...prev, dias: ordenados.join(', ') }));
    if (errores.dias) setErrores((prev) => ({ ...prev, dias: '' }));
  };

  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (bloque) {
      setFormData({
        nivel: bloque.nivel || '',
        dias: bloque.dias || '',
        horaInicio: bloque.horaInicio ? toLocalDatetimeInputValue(bloque.horaInicio) : '',
        horaFin: bloque.horaFin ? toLocalDatetimeInputValue(bloque.horaFin) : '',
        anio: bloque.anio || new Date().getFullYear(),
      });
    } else {
      setFormData({
        nivel: '',
        dias: '',
        horaInicio: '',
        horaFin: '',
        anio: new Date().getFullYear(),
      });
    }
    setErrores({});
  }, [bloque, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo si existe
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validarForm = () => {
    const nuevosErrores = {};

    if (!formData.nivel) nuevosErrores.nivel = 'El nivel es requerido';
    if (!formData.dias) nuevosErrores.dias = 'Los días son requeridos';
    if (!formData.horaInicio) nuevosErrores.horaInicio = 'La hora de inicio es requerida';
    if (!formData.horaFin) nuevosErrores.horaFin = 'La hora de fin es requerida';

    if (formData.horaInicio && formData.horaFin) {
      if (new Date(formData.horaInicio) >= new Date(formData.horaFin)) {
        nuevosErrores.horaFin = 'La hora de fin debe ser después de la de inicio';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarForm()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{bloque ? 'Editar Bloque' : 'Crear Nuevo Bloque'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="nivel">Nivel</label>
            <select
              id="nivel"
              name="nivel"
              value={formData.nivel}
              onChange={handleChange}
              className={errores.nivel ? 'error' : ''}
            >
              <option value="">Selecciona un nivel</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
            </select>
            {errores.nivel && <span className="error-msg">{errores.nivel}</span>}
          </div>

          <div className="form-group">
            <label>Días</label>
            <div className={`dias-selector${errores.dias ? ' error' : ''}`}>
              {DIAS_SEMANA.map((dia) => (
                <button
                  key={dia}
                  type="button"
                  className={`dia-chip${diasSeleccionados.includes(dia) ? ' active' : ''}`}
                  onClick={() => handleToggleDia(dia)}
                >
                  {dia.slice(0, 3)}
                </button>
              ))}
            </div>
            {diasSeleccionados.length > 0 && (
              <p className="dias-preview">{formData.dias}</p>
            )}
            {errores.dias && <span className="error-msg">{errores.dias}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="horaInicio">Hora de Inicio</label>
            <input
              id="horaInicio"
              type="datetime-local"
              name="horaInicio"
              value={formData.horaInicio}
              onChange={handleChange}
              className={errores.horaInicio ? 'error' : ''}
            />
            {errores.horaInicio && <span className="error-msg">{errores.horaInicio}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="horaFin">Hora de Fin</label>
            <input
              id="horaFin"
              type="datetime-local"
              name="horaFin"
              value={formData.horaFin}
              onChange={handleChange}
              className={errores.horaFin ? 'error' : ''}
            />
            {errores.horaFin && <span className="error-msg">{errores.horaFin}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="anio">Año</label>
            <input
              id="anio"
              type="number"
              name="anio"
              value={formData.anio}
              onChange={handleChange}
              min="2020"
              max="2050"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
