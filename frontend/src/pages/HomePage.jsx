// Archivo: frontend/src/pages/HomePage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [animales, setAnimales] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimales = async () => {
      try {
        // Esta ruta es pública, no requiere token
        const response = await axios.get('http://localhost:3000/api/animales');
        setAnimales(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar animales:", error);
        setLoading(false);
      }
    };
    fetchAnimales();
  }, []);

  // Lógica de filtrado (Nombre o Especie)
  const animalesFiltrados = animales.filter(animal => 
    animal.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    animal.especie.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO SECTION (Portada) */}
      <div className="bg-blue-600 text-white py-20 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">Adopta, no compres</h1>
        <p className="text-xl max-w-2xl mx-auto">
          Miles de compañeros peludos están esperando una segunda oportunidad. 
          Encuentra a tu mejor amigo hoy mismo.
        </p>
      </div>

      {/* BUSCADOR */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <input 
          type="text" 
          placeholder="¿Buscas un gato, un perro, o un nombre específico?" 
          className="w-full p-4 rounded-lg shadow-lg border-2 border-white focus:border-blue-500 focus:outline-none text-lg"
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {/* GALERÍA */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <p className="text-center text-gray-500">Cargando amigos...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {animalesFiltrados.map((animal) => (
              <div key={animal.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
                
                {/* FOTO */}
                <div className="h-64 w-full bg-gray-200 relative">
                  {animal.foto_url ? (
                    <img 
                      src={animal.foto_url} 
                      alt={animal.nombre} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">Sin Foto</div>
                  )}
                  
                  {/* Etiqueta Urgente */}
                  {animal.urgent && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow animate-pulse">
                      ¡URGENTE!
                    </span>
                  )}
                </div>

                {/* INFO */}
                <div className="p-5">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-2xl font-bold text-gray-800">{animal.nombre}</h3>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold uppercase">
                      {animal.especie}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {animal.descripcion}
                  </p>

                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-gray-500 text-sm">{animal.edad} años</span>
                   <Link 
                    to={`/animal/${animal.id}`} 
                    className="text-blue-600 font-bold hover:text-blue-800"
                      >
                        Ver Detalles →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && animalesFiltrados.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No encontramos animales con ese criterio 😢</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;