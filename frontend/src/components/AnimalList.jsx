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

  const fetchAnimales = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page, limit: 8, order: filtroFecha });
      if (filtroEspecie) params.append('especie', filtroEspecie);
      
      const response = await axios.get(`${API_URL}/api/animales?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = Array.isArray(response.data) ? response.data : (response.data.animales || []);
      setAnimales(data);
      setTotal(response.data.total ?? data.length);
    } catch (error) {
      console.error("Error cargando animales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnimales(); }, [refreshTrigger, page, filtroEspecie, filtroFecha]);
  useEffect(() => { setPage(1); }, [filtroEspecie, filtroFecha]);

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
      const payload = {
        ...animal, // Enviamos todo el objeto para mantener consistencia
        estado: 'adoptado'
      };

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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-24" />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col w-full">
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

      {/* ESTADO VACÍO */}
      {animales.length === 0 ? (
        <div className="bg-yellow-50 p-6 rounded-xl text-yellow-700 text-center border border-yellow-200">
          <p className="font-bold">No hay animales activos.</p>
        </div>
      ) : (
        <>
          {/* GRID DE 4 COLUMNAS (xl:grid-cols-4) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {animales.map((animal) => (
              <div key={animal.id} className="bg-white border border-gray-100 rounded-xl p-3 flex gap-3 shadow-sm hover:shadow-md transition items-center min-w-0">
                
                {/* FOTO PEQUEÑA (Mantenemos tu estilo original de 16x16) */}
                <div className="w-14 h-14 shrink-0 relative">
                  {animal.foto_url ? (
                    <img
                      src={animal.foto_url}
                      alt={animal.nombre}
                      className="w-full h-full object-cover rounded-lg border border-gray-100"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center text-[10px] text-gray-400 border border-gray-100">
                      Sin Foto
                    </div>
                  )}
                  {animal.urgent && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" title="Urgente" />
                  )}
                </div>

                {/* DATOS COMPACTOS */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    <h4 className="text-sm font-bold text-gray-800 truncate" title={animal.nombre}>
                      {animal.nombre}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">
                        {animal.especie}
                      </span>
                      <span className="text-[9px] text-gray-400 font-medium">
                         {animal.edad ? `${animal.edad}a` : '?a'}
                      </span>
                    </div>
                    
                    {/* BOTONES PEQUEÑOS ABAJO */}
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setEditAnimal(animal)} className="text-gray-400 hover:text-blue-500 transition" title="Editar">
                        ✏️
                      </button>
                      {animal.estado !== 'adoptado' && (
                        <button onClick={() => handleMarkAdopted(animal)} className="text-gray-400 hover:text-green-500 transition" title="Adoptado">
                          🏠
                        </button>
                      )}
                      <button onClick={() => handleDelete(animal.id)} className="text-gray-400 hover:text-red-500 transition" title="Archivar">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINACIÓN */}
          {total > 8 && (
            <div className="flex justify-center items-center gap-3 mt-8 pt-6 border-t border-gray-100">
              <button disabled={page === 1} onClick={() => handlePageChange(page - 1)}
                className="px-3 py-1.5 rounded-lg border bg-white text-xs font-bold disabled:opacity-30">
                Anterior
              </button>
              <span className="text-xs font-bold text-gray-500">
                {page} / {Math.ceil(total / 8)}
              </span>
              <button disabled={page === Math.ceil(total / 8)} onClick={() => handlePageChange(page + 1)}
                className="px-3 py-1.5 rounded-lg border bg-white text-xs font-bold disabled:opacity-30">
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnimalList;