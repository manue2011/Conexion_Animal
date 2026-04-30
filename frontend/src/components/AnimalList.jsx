import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AnimalList = ({ refreshTrigger, setEditAnimal }) => {
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filtroEspecie, setFiltroEspecie] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('desc');

  const [view, setView] = useState('activos');

const fetchAnimales = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page, limit: 8, order: filtroFecha });
      if (filtroEspecie) params.append('especie', filtroEspecie);
      
      const endpoint = view === 'activos' ? '/api/animales' : '/api/animales/adoptados/lista';
      
      const response = await axios.get(`${API_URL}${endpoint}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data.animales || [];
      setAnimales(data);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Error cargando animales:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. AÑADIMOS 'view' A LOS ARRAYS DE DEPENDENCIAS
  useEffect(() => { fetchAnimales(); }, [refreshTrigger, page, filtroEspecie, filtroFecha, view]);
  useEffect(() => { setPage(1); }, [filtroEspecie, filtroFecha, view]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres archivar este animal?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/animales/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAnimales();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const handleMarkAdopted = async (animal) => {
    if (!window.confirm(`¿Seguro que quieres marcar a ${animal.nombre} como adoptado?`)) return;
    try {
      const token = localStorage.getItem('token');
      const payload = { ...animal, estado: 'adoptado' };

      await axios.put(`${API_URL}/api/animales/${animal.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchAnimales();
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert('Error al actualizar el estado a adoptado');
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && animales.length === 0) return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-64 w-full" />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      
      {/* 4. LAS PESTAÑAS (TABS) */}
      <div className="flex gap-2 mb-6 bg-gray-200/50 p-1.5 rounded-2xl w-fit shadow-inner">
        <button 
          onClick={() => setView('activos')}
          className={`px-6 py-2 rounded-xl font-black text-xs uppercase transition-all ${view === 'activos' ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-gray-500 hover:text-gray-700'}`}
        >
          🏠 En Adopción
        </button>
        <button 
          onClick={() => setView('adoptados')}
          className={`px-6 py-2 rounded-xl font-black text-xs uppercase transition-all ${view === 'adoptados' ? 'bg-white text-green-600 shadow-md scale-105' : 'text-gray-500 hover:text-gray-700'}`}
        >
          🎉 Adoptados
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={filtroEspecie} onChange={e => setFiltroEspecie(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todas las especies</option>
          <option value="perro">Perro</option>
          <option value="gato">Gato</option>
          <option value="ave">Ave</option>
          <option value="roedor">Roedor</option>
          <option value="reptil">Reptil</option>
          <option value="otro">Otro</option>
        </select>
        <select value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500">
          <option value="desc">Más recientes</option>
          <option value="asc">Más antiguos</option>
        </select>
      </div>

      {animales.length === 0 ? (
        <div className="bg-yellow-50 p-6 rounded-xl text-yellow-700 text-center border border-yellow-200">
          <p className="font-bold">No hay animales en esta sección.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            {animales.map((animal) => (
              <div key={animal.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 group min-w-0 relative">
                
                {/* Overlay de ADOPTADO si estamos en esa vista */}
                {view === 'adoptados' && (
                  <div className="absolute inset-0 bg-green-500/10 pointer-events-none z-10" />
                )}

                <div className="h-40 w-full bg-gray-100 relative overflow-hidden shrink-0">
                  <img
                    src={animal.foto_url}
                    alt={animal.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {animal.urgent && view === 'activos' && (
                    <div className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[10px] px-2 py-1 rounded-full font-black animate-pulse shadow-lg uppercase tracking-tighter">
                        Urgente
                    </div>
                  )}
                </div>

                <div className="p-4 md:p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-1.5 gap-2">
                    <h4 className="text-base md:text-lg font-extrabold text-gray-800 truncate">{animal.nombre}</h4>
                    <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1 rounded-md uppercase font-bold shrink-0">
                      {animal.especie}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm italic mb-5 flex-1">
                    {animal.edad ? `${animal.edad} años` : 'Edad desconocida'}
                  </p>

                  <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
                    <button 
                      onClick={() => setEditAnimal(animal)} 
                      className="text-gray-400 hover:text-blue-500 bg-gray-50 hover:bg-blue-100 p-3 rounded-xl transition-all" 
                    >
                      <span className="text-xl md:text-2xl">✏️</span>
                    </button>

                    {/* Solo mostramos el botón de hogar si están activos */}
                    {view === 'activos' && (
                      <button 
                        onClick={() => handleMarkAdopted(animal)} 
                        className="text-gray-400 hover:text-green-500 bg-gray-50 hover:bg-green-100 p-3 rounded-xl transition-all" 
                      >
                        <span className="text-xl md:text-2xl">🏠</span>
                      </button>
                    )}

                    <button 
                      onClick={() => handleDelete(animal.id)} 
                      className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-100 p-3 rounded-xl transition-all" 
                    >
                      <span className="text-xl md:text-2xl">🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINACIÓN */}
          {total > 8 && (
            <div className="flex justify-center items-center gap-3 mt-10 pb-4 pt-6 border-t border-gray-200">
              <button disabled={page === 1} onClick={() => handlePageChange(page - 1)} className="px-4 py-2 rounded-xl border bg-white text-gray-600 font-bold text-sm disabled:opacity-30">← Anterior</button>
              <span className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl">Página {page} de {Math.ceil(total / 8)}</span>
              <button disabled={page === Math.ceil(total / 8)} onClick={() => handlePageChange(page + 1)} className="px-4 py-2 rounded-xl border bg-white text-gray-600 font-bold text-sm disabled:opacity-30">Siguiente →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnimalList;