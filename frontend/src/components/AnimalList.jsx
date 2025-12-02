// Archivo: frontend/src/components/AnimalList.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

// Recibimos una propiedad 'refreshTrigger' para saber cuándo recargar la lista
const AnimalList = ({ refreshTrigger }) => {
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para descargar los datos
  const fetchAnimales = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/animales');
      setAnimales(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando animales:", error);
      setLoading(false);
    }
  };

  // Se ejecuta al cargar la página Y cuando cambia 'refreshTrigger'
  useEffect(() => {
    fetchAnimales();
  }, [refreshTrigger]);

  // Función para borrar (Soft Delete)
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres archivar este animal?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/animales/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Recargamos la lista para que desaparezca
      fetchAnimales();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  if (loading) return <p className="text-gray-500">Cargando lista...</p>;

  if (animales.length === 0) {
    return (
      <div className="bg-yellow-50 p-4 rounded text-yellow-700">
        No hay animales activos. ¡Añade uno!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[500px] pr-2">
      {animales.map((animal) => (
        <div key={animal.id} className="bg-white border rounded-lg p-4 flex gap-4 shadow-sm hover:shadow-md transition">
          {/* FOTO */}
          <div className="w-24 h-24 flex-shrink-0">
            {animal.foto_url ? (
              <img 
                src={animal.foto_url} 
                alt={animal.nombre} 
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs">
                Sin Foto
              </div>
            )}
          </div>

          {/* DATOS */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-bold text-gray-800">{animal.nombre}</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full uppercase font-semibold">
                  {animal.especie}
                </span>
                {animal.urgent && (
                  <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-bold">
                    URGENTE
                  </span>
                )}
              </div>
              <button 
                onClick={() => handleDelete(animal.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded"
                title="Archivar"
              >
                🗑️
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
              {animal.descripcion}
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Edad: {animal.edad} años
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimalList;