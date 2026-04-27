import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const LIMIT = 8;

const HomePage = () => {
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtros, setFiltros] = useState({
    ubicacion: '',
    especie: 'Todos',
    urgent: false
  });

  useEffect(() => {
    // Al cambiar filtros, volvemos a página 1
    setCurrentPage(1);
  }, [filtros]);

  useEffect(() => {
    const fetchAnimales = async () => {
      setLoading(true);
      try {
        const { ubicacion, especie, urgent } = filtros;
        const url = `${API_URL}/api/animales/public?ubicacion=${ubicacion}&especie=${especie}&urgent=${urgent}&page=${currentPage}&limit=${LIMIT}`;
        const response = await axios.get(url);
        setAnimales(response.data.animales);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error al cargar catálogo:', error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchAnimales();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [filtros, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <div className="bg-blue-600 text-white py-12 md:py-16 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">Adopta, no compres</h1>
        <p className="text-base md:text-xl max-w-2xl mx-auto opacity-90">
          Encuentra a tu mejor amigo entre cientos de animales esperando un hogar.
        </p>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 md:-mt-10">
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 items-stretch sm:items-end">

          <div className="w-full sm:flex-1 sm:min-w-[200px]">
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">
              📍 ¿Dónde lo buscas?
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej: Madrid, Sevilla..."
                className="w-full p-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-base shadow-inner pr-10"
                onChange={(e) => setFiltros({ ...filtros, ubicacion: e.target.value })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none text-xl">🏙️</span>
            </div>
          </div>

          <div className="w-full sm:w-44">
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">Especie</label>
            <select
              className="w-full p-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:outline-none transition-all text-base appearance-none cursor-pointer"
              onChange={(e) => setFiltros({ ...filtros, especie: e.target.value })}
            >
              <option value="Todos">🌈 Todos</option>
              <option value="Perro">🐶 Perros</option>
              <option value="Gato">🐱 Gatos</option>
              <option value="Roedor">🐹 Roedores</option>
              <option value="Ave">🦜 Aves</option>
              <option value="Reptil">🦎 Reptiles</option>
              <option value="Otro">🐾 Otros</option>
            </select>
          </div>

          <div
            className="flex items-center gap-3 px-4 py-3 bg-red-50 rounded-xl border-2 border-transparent hover:border-red-200 cursor-pointer transition-all"
            onClick={() => setFiltros({ ...filtros, urgent: !filtros.urgent })}
          >
            <input
              type="checkbox"
              checked={filtros.urgent}
              readOnly
              className="w-5 h-5 accent-red-600 cursor-pointer"
            />
            <label className="text-sm font-bold text-red-700 cursor-pointer select-none whitespace-nowrap">
              Solo Casos Urgentes
            </label>
          </div>
        </div>
      </div>

      {/* GALERÍA */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Buscando compañeros...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {animales.map((animal) => (
                <div key={animal.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
                  <div className="h-40 sm:h-48 md:h-56 w-full overflow-hidden relative">
                    <img
                      src={animal.foto_url || 'https://via.placeholder.com/400x300?text=🐾'}
                      alt={animal.nombre}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    {animal.urgent && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] md:text-[10px] font-black px-2 py-1 rounded-full shadow-lg animate-pulse uppercase tracking-tighter">
                        Urgente
                      </div>
                    )}
                  </div>

                  <div className="p-3 md:p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-1 gap-1">
                      <h3 className="text-base md:text-xl font-bold text-gray-800 leading-tight truncate">{animal.nombre}</h3>
                      <span className="text-[9px] md:text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase shrink-0">
                        {animal.especie}
                      </span>
                    </div>

                    <p className="text-gray-400 text-xs mb-2 flex items-center gap-1 font-bold italic truncate">
                      📍 {animal.ubicacion || 'Sin ubicación'}
                    </p>

                    <p className="text-gray-500 text-xs md:text-sm mb-4 line-clamp-2 italic flex-1">
                      "{animal.descripcion || 'Sin descripción disponible'}"
                    </p>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                      <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                        {animal.edad} años
                      </span>
                      <Link
                        to={`/animal/${animal.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-colors shadow-md"
                      >
                        Conóceme →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {animales.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-5xl mb-4">😿</p>
                <h3 className="text-xl font-bold text-gray-800">No hay resultados</h3>
                <p className="text-gray-500">Prueba a cambiar los filtros de búsqueda.</p>
              </div>
            )}

            {/* PAGINACIÓN */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">

                {/* Botón anterior */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold text-sm hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>

                {/* Números de página */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition border ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Botón siguiente */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold text-sm hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            )}

            {/* Contador de resultados */}
            {animales.length > 0 && (
              <p className="text-center text-gray-400 text-sm mt-4">
                Página {currentPage} de {totalPages}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;