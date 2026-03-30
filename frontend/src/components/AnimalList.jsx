import { useEffect, useState } from 'react';
import axios from 'axios';

const AnimalList = ({ refreshTrigger }) => {
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. FUNCIÓN PARA DESCARGAR LOS DATOS (Corregida con Token)
  const fetchAnimales = async () => {
    try {
      const token = localStorage.getItem('token'); // <-- Recuperamos el token
      
      const response = await axios.get('http://localhost:3000/api/animales', {
        headers: {
          Authorization: `Bearer ${token}` // <-- Le enseñamos el carnet al backend
        }
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

  // 2. FUNCIÓN PARA BORRAR (Ya estaba bien, la mantenemos)
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres archivar este animal?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/animales/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAnimales();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  if (loading) return <p className="text-gray-500 text-center p-4">Cargando lista...</p>;

  if (animales.length === 0) {
    return (
      <div className="bg-yellow-50 p-4 rounded text-yellow-700 text-center border border-yellow-200">
        No hay animales activos. ¡Añade uno desde el formulario!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[550px] pr-2">
      {animales.map((animal) => (
        <div key={animal.id} className="bg-white border rounded-lg p-4 flex gap-4 shadow-sm hover:shadow-md transition items-center">
          {/* FOTO */}
          <div className="w-20 h-20 flex-shrink-0">
            {animal.foto_url ? (
              <img 
                src={animal.foto_url} 
                alt={animal.nombre} 
                className="w-full h-full object-cover rounded-md border"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-[10px] text-center p-1">
                Sin Foto
              </div>
            )}
          </div>

          {/* DATOS */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="truncate">
                <h4 className="text-base font-bold text-gray-800 truncate">{animal.nombre}</h4>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase font-bold">
                    {animal.especie}
                  </span>
                  {animal.urgent && (
                    <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold animate-pulse">
                      URGENTE
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleDelete(animal.id)}
                className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition"
              >
                🗑️
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-2 italic">
              {animal.edad ? `${animal.edad} años` : 'Edad desconocida'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimalList;