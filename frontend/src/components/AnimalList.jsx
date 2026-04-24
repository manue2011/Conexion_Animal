import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AnimalList = ({ refreshTrigger }) => {
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnimales = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/animales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnimales(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando animales:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimales();
  }, [refreshTrigger]);

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

  if (loading) return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-24" />
      ))}
    </div>
  );

  if (animales.length === 0) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 text-sm text-center border border-yellow-200">
        No hay animales activos. ¡Añade uno desde el formulario!
      </div>
    );
  }

  return (
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

              <button
                onClick={() => handleDelete(animal.id)}
                className="text-red-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition shrink-0"
                aria-label={`Archivar ${animal.nombre}`}
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimalList;