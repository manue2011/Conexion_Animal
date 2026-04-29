import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// IMPORTANTE: Asegúrate de pasar setEditAnimal desde el componente padre
const AnimalList = ({ refreshTrigger, setEditAnimal }) => {
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filtroEspecie, setFiltroEspecie] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('desc');

  const fetchAnimales = async () => {
    setLoading(true); // Mostrar carga al aplicar filtros
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
        nombre: animal.nombre,
        descripcion: animal.descripcion,
        edad: animal.edad,
        especie: animal.especie,
        urgent: animal.urgent,
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

  if (loading && animales.length === 0) return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-24" />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      {/* FILTROS */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={filtroEspecie} onChange={e => setFiltroEspecie(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Todas las especies</option>
          <option value="perro">Perro</option>
          <option value="gato">Gato</option>
          <option value="ave">Ave</option>
          <option value="roedor">Roedor</option>
          <option value="reptil">Reptil</option>
          <option value="otro">Otro</option>
        </select>
        <select value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white">
          <option value="desc">Más recientes</option>
          <option value="asc">Más antiguos</option>
        </select>
      </div>

      {/* ESTADO VACÍO (Movido aquí para que no borre los filtros de la pantalla) */}
      {animales.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 text-sm text-center border border-yellow-200">
          No hay animales. ¡Añade uno o cambia los filtros de búsqueda!
        </div>
      ) : (
        <>
          {/* LISTA GRID */}
          <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[550px] pr-1">
            {animales.map((animal) => (
              <div key={animal.id} className="bg-white border border-gray-100 rounded-lg p-3 md:p-4 flex gap-3 shadow-sm hover:shadow-md transition items-center">

                {/* FOTO */}
                <div className="w-16 h-16 md:w-20 md:h-20 shrink-0">
                  {animal.foto_url ? (
                    <img
                      src={animal.foto_url}
                      alt={animal.nombre}
                      className="w-full h-full object-cover rounded-md border border-gray-100"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-[10px] text-center p-1">
                      Sin Foto
                    </div>
                  )}
                </div>

                {/* DATOS */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm md:text-base font-bold text-gray-800 truncate">{animal.nombre}</h4>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase font-bold">
                          {animal.especie}
                        </span>
                        {animal.urgent && (
                          <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold animate-pulse">
                            URGENTE
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-[11px] mt-1.5 italic">
                        {animal.edad ? `${animal.edad} años` : 'Edad desconocida'}
                      </p>
                    </div>

                    {/* BOTONES DE ACCIÓN AGRUPADOS */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setEditAnimal(animal)}
                        className="text-blue-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition"
                        aria-label={`Editar ${animal.nombre}`}>
                        ✏️
                      </button>

                      {animal.estado !== 'adoptado' && (
                        <button onClick={() => handleMarkAdopted(animal)}
                          className="text-green-400 hover:text-green-600 p-1.5 rounded-full hover:bg-green-50 transition"
                          aria-label={`Marcar adoptado ${animal.nombre}`}>
                          🏠
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(animal.id)}
                        className="text-red-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition"
                        aria-label={`Archivar ${animal.nombre}`}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINACIÓN */}
          {Math.ceil(total / 8) > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-lg bg-white border text-sm disabled:opacity-40 hover:bg-gray-50">
                ← Anterior
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">{page} / {Math.ceil(total / 8)}</span>
              <button disabled={page === Math.ceil(total / 8)} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-lg bg-white border text-sm disabled:opacity-40 hover:bg-gray-50">
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnimalList;