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

  const coloniasFiltradas = colonias.filter(colonia =>
    colonia.codigo_postal && colonia.codigo_postal.includes(filtroCP)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* CABECERA */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-3 md:mb-4">
            🗺️ Red de Colonias Felinas
          </h1>
          <p className="text-sm md:text-lg text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto">
            Descubre los puntos de alimentación cercanos a ti. Encuentra tu código postal y únete a la red de voluntarios locales.
          </p>

          <div className="max-w-md mx-auto">
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl">📍</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Busca por Código Postal (Ej: 28001)..."
                value={filtroCP}
                onChange={(e) => setFiltroCP(e.target.value.replace(/\D/g, ''))}
                maxLength="5"
                className="w-full pl-11 pr-4 py-3 md:py-4 rounded-full border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm text-sm md:text-base font-bold text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* ESTADOS */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <div className="bg-gray-200 h-16" />
                <div className="p-5 space-y-3">
                  <div className="bg-gray-100 h-4 rounded w-3/4" />
                  <div className="bg-gray-100 h-4 rounded w-1/2" />
                  <div className="bg-gray-100 h-10 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center text-sm max-w-2xl mx-auto">
            {error}
          </div>
        ) : (
          <>
            <p className="text-gray-500 font-bold mb-4 md:mb-6 text-sm">
              {coloniasFiltradas.length} {coloniasFiltradas.length === 1 ? 'colonia encontrada' : 'colonias encontradas'}
              {filtroCP && ` en el C.P. ${filtroCP}`}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {coloniasFiltradas.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <span className="text-5xl mb-4 block">🐈</span>
                  <p className="text-gray-500 text-sm md:text-lg">No hemos encontrado colonias activas en este código postal.</p>
                </div>
              ) : (
                coloniasFiltradas.map((colonia) => (
                  <div key={colonia.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col">
                    <div className="bg-blue-600 p-3 md:p-4">
                      <h3 className="text-base md:text-xl font-bold text-white truncate">{colonia.nombre}</h3>
                    </div>

                    <div className="p-4 md:p-6 flex-1 flex flex-col">
                      <p className="text-gray-600 text-xs md:text-sm mb-4 flex-1 line-clamp-3">
                        {colonia.descripcion || 'Sin descripción detallada.'}
                      </p>

                      <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-100">
                        <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">Ubicación</p>
                        <p className="text-gray-800 font-medium text-xs md:text-sm">{colonia.direccion}</p>
                        <p className="text-blue-800 font-bold text-sm mt-1">C.P. {colonia.codigo_postal}</p>
                      </div>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(colonia.direccion + ', ' + colonia.codigo_postal)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-gray-900 hover:bg-black text-white font-bold py-2.5 md:py-3 px-4 rounded-xl transition shadow-md text-sm"
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