import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ColoniasPublic = () => {
  const [colonias, setColonias] = useState([]);
  const [filtroCP, setFiltroCP] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchColonias = async () => {
      try {
        // Llamamos a la ruta pública usando API_URL
        const res = await axios.get(`${API_URL}/api/usuarios/public`);
        setColonias(res.data);
      } catch (err) {
        console.error("Error al cargar colonias:", err);
        setError("No se pudieron cargar las colonias en este momento.");
      } finally {
        setLoading(false);
      }
    };
    fetchColonias();
  }, []);

  // Filtramos la lista en tiempo real según lo que escriba en el buscador
  const coloniasFiltradas = colonias.filter(colonia => 
    colonia.codigo_postal && colonia.codigo_postal.includes(filtroCP)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* CABECERA Y BUSCADOR */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            🗺️ Red de Colonias Felinas
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Descubre los puntos de alimentación cercanos a ti. Encuentra tu código postal y únete a la red de voluntarios locales.
          </p>

          <div className="max-w-md mx-auto">
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl">📍</span>
              <input 
                type="text" 
                placeholder="Busca por Código Postal (Ej: 28001)..."
                value={filtroCP}
                onChange={(e) => setFiltroCP(e.target.value)}
                maxLength="5"
                className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm text-lg font-bold text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* CONTENIDO (CARGA / ERROR / TARJETAS) */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-bold text-xl animate-pulse">Cargando mapa de colonias...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center max-w-2xl mx-auto">
            {error}
          </div>
        ) : (
          <>
            {/* CONTADOR DE RESULTADOS */}
            <p className="text-gray-500 font-bold mb-6">
              {coloniasFiltradas.length} {coloniasFiltradas.length === 1 ? 'colonia encontrada' : 'colonias encontradas'} {filtroCP && `en el C.P. ${filtroCP}`}
            </p>

            {/* GRID DE COLONIAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coloniasFiltradas.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <span className="text-6xl mb-4 block">🐈</span>
                  <p className="text-gray-500 text-lg">No hemos encontrado colonias activas en este código postal.</p>
                </div>
              ) : (
                coloniasFiltradas.map((colonia) => (
                  <div key={colonia.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col">
                    <div className="bg-blue-600 p-4">
                      <h3 className="text-xl font-bold text-white truncate">{colonia.nombre}</h3>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">
                        {colonia.descripcion || 'Sin descripción detallada.'}
                      </p>
                      
                      <div className="bg-blue-50 p-3 rounded-lg mb-6 border border-blue-100">
                        <p className="text-xs text-blue-500 font-bold uppercase mb-1">Ubicación</p>
                        <p className="text-gray-800 font-medium text-sm">{colonia.direccion}</p>
                        <p className="text-blue-800 font-bold mt-1">C.P. {colonia.codigo_postal}</p>
                      </div>

                      {/* BOTÓN MÁGICO DE GOOGLE MAPS */}
                        <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(colonia.direccion + ', ' + colonia.codigo_postal)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition shadow-md"
                        >
                        📍 Abrir en Google Maps
                        </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ColoniasPublic;