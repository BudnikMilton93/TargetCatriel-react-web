import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import content from '../../../data/content.json';
import '../../../styles/pages/dashboard.css';

export default function DashboardMarketing() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('noticias');
  const [noticias, setNoticias] = useState(content.noticias || []);
  const [viajes, setViajes] = useState(content.viajes || []);
  const [newNoticia, setNewNoticia] = useState({ titulo: '', copete: '', cuerpo: '', imagen: '' });
  const [editingId, setEditingId] = useState(null);

  const handleAddNoticia = () => {
    if (newNoticia.titulo && newNoticia.cuerpo) {
      const noticia = {
        id: `n${Date.now()}`,
        ...newNoticia,
        fecha: new Date().toISOString().split('T')[0],
      };
      setNoticias([noticia, ...noticias]);
      setNewNoticia({ titulo: '', copete: '', cuerpo: '', imagen: '' });
    }
  };

  const handleDeleteNoticia = (id) => {
    setNoticias(noticias.filter(n => n.id !== id));
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Panel de Marketing</h1>
          <p>Bienvenido, {user?.name}</p>
        </div>
        <button onClick={logout} className="btn-logout">Cerrar sesión</button>
      </header>

      <div className="dashboard-content">
        <div className="tabs-navigation">
          <button 
            className={`tab ${tab === 'noticias' ? 'active' : ''}`}
            onClick={() => setTab('noticias')}
          >
            Noticias
          </button>
          <button 
            className={`tab ${tab === 'viajes' ? 'active' : ''}`}
            onClick={() => setTab('viajes')}
          >
            Viajes
          </button>
          <button 
            className={`tab ${tab === 'galeria' ? 'active' : ''}`}
            onClick={() => setTab('galeria')}
          >
            Galería
          </button>
          <button 
            className={`tab ${tab === 'sobre-nosotros' ? 'active' : ''}`}
            onClick={() => setTab('sobre-nosotros')}
          >
            Sobre Nosotros
          </button>
        </div>

        {tab === 'noticias' && (
          <section className="section-marketing">
            <h2>Gestión de Noticias</h2>
            
            <div className="form-noticia">
              <h3>Crear Nueva Noticia</h3>
              <input
                type="text"
                placeholder="Título"
                value={newNoticia.titulo}
                onChange={(e) => setNewNoticia({ ...newNoticia, titulo: e.target.value })}
              />
              <input
                type="text"
                placeholder="Copete (resumen corto)"
                value={newNoticia.copete}
                onChange={(e) => setNewNoticia({ ...newNoticia, copete: e.target.value })}
              />
              <textarea
                placeholder="Cuerpo de la noticia"
                value={newNoticia.cuerpo}
                onChange={(e) => setNewNoticia({ ...newNoticia, cuerpo: e.target.value })}
                rows={4}
              />
              <input
                type="text"
                placeholder="URL de imagen"
                value={newNoticia.imagen}
                onChange={(e) => setNewNoticia({ ...newNoticia, imagen: e.target.value })}
              />
              <button onClick={handleAddNoticia} className="btn-primary">Publicar Noticia</button>
            </div>

            <div className="noticias-list">
              <h3>Noticias Publicadas</h3>
              {noticias.map(noticia => (
                <div key={noticia.id} className="noticia-item">
                  <h4>{noticia.titulo}</h4>
                  <p className="fecha">{noticia.fecha}</p>
                  <p>{noticia.copete}</p>
                  <div className="item-actions">
                    <button className="btn-secondary">Editar</button>
                    <button className="btn-danger" onClick={() => handleDeleteNoticia(noticia.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'viajes' && (
          <section className="section-marketing">
            <h2>Gestión de Viajes</h2>
            <button className="btn-primary">+ Crear Viaje</button>
            <div className="viajes-list">
              {viajes.map(viaje => (
                <div key={viaje.id} className="viaje-item">
                  <h3>{viaje.destino}</h3>
                  <p><strong>Fechas:</strong> {viaje.fechas}</p>
                  <p><strong>Nivel:</strong> {viaje.nivelRecomendado}</p>
                  <p><strong>Precio:</strong> ${viaje.precio}</p>
                  <p><strong>Cupos:</strong> {viaje.cupos}</p>
                  <div className="item-actions">
                    <button className="btn-secondary">Editar</button>
                    <button className="btn-danger">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'galeria' && (
          <section className="section-marketing">
            <h2>Galería</h2>
            <button className="btn-primary">+ Subir Foto/Video</button>
            <p>Gestor de galería...</p>
          </section>
        )}

        {tab === 'sobre-nosotros' && (
          <section className="section-marketing">
            <h2>Sobre Nosotros</h2>
            <p>Editar contenido institucional...</p>
          </section>
        )}
      </div>
    </div>
  );
}
