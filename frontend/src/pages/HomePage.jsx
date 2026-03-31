import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- NUEVO: Estado de filtros que coincide con nuestro Backend ---
  const [filtros, setFiltros] = useState({
    ubicacion: '',
    especie: 'Todos',
    urgent: false
  });

  // Cada vez que cambie 'filtros', el useEffect se dispara y pide datos nuevos
 useEffect(() => {
  const fetchAnimales = async () => {
    setLoading(true);
    try {
      // 1. Sacamos ubicacion del estado
      const { ubicacion, especie, urgent } = filtros; 
      
      // 2. La añadimos a la URL (quitamos 'nombre' si ya no lo usas)
      const url = `http://localhost:3000/api/animales/public?ubicacion=${ubicacion}&especie=${especie}&urgent=${urgent}`;
      
      const response = await axios.get(url);
      setAnimales(response.data);
    } catch (error) {
      console.error("Error al cargar catálogo:", error);
    } finally {
      setLoading(false);
    }
  };

  const delayDebounceFn = setTimeout(() => {
    fetchAnimales();
  }, 300);

  return () => clearTimeout(delayDebounceFn);
}, [filtros]); 

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HERO SECTION */}
      <div className="bg-blue-600 text-white py-16 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">Adopta, no compres</h1>
        <p className="text-xl max-w-2xl mx-auto opacity-90">
          Encuentra a tu mejor amigo entre cientos de animales esperando un hogar.
        </p>
      </div>

      {/* --- NUEVO: BARRA DE BÚSQUEDA AVANZADA --- */}
      <div className="max-w-6xl mx-auto px-4 -mt-10">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-wrap gap-4 items-end">
          
                  {/* FILTRO POR UBICACIÓN */}
              {/* FILTRO POR UBICACIÓN (INPUT DE TEXTO) */}
              <div className="flex-1 min-w-[250px]">
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">
                  📍 ¿Dónde lo buscas?
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Ej: Madrid, Sevilla, Valencia..." 
                      className="w-full p-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-lg shadow-inner pr-10"
                      onChange={(e) => setFiltros({...filtros, ubicacion: e.target.value})}
                    />
                    {/* Icono decorativo opcional al final del input */}
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none text-xl">
                      🏙️
                    </span>
                  </div>
                </div>

          {/* Filtrar por Especie */}
          <div className="w-48">
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">Especie</label>
            <select 
              className="w-full p-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:outline-none transition-all text-lg appearance-none cursor-pointer"
              onChange={(e) => setFiltros({...filtros, especie: e.target.value})}
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

          {/* Checkbox Urgente */}
          <div className="flex items-center gap-3 pb-3 px-4 h-[52px] bg-red-50 rounded-xl border-2 border-transparent hover:border-red-200 cursor-pointer transition-all"
               onClick={() => setFiltros({...filtros, urgent: !filtros.urgent})}>
            <input 
              type="checkbox" 
              checked={filtros.urgent}
              readOnly
              className="w-5 h-5 accent-red-600 cursor-pointer"
            />
            <label className="text-sm font-bold text-red-700 cursor-pointer select-none">
              Solo Casos Urgentes
            </label>
          </div>
        </div>
      </div>

      {/* GALERÍA DE ANIMALES */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Buscando compañeros...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {animales.map((animal) => (
                <div key={animal.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
                  
                  {/* FOTO CON HOVER EFECTO */}
                  <div className="h-60 w-full overflow-hidden relative">
                    <img 
                      src={animal.foto_url || 'https://via.placeholder.com/400x300?text=🐾'} 
                      alt={animal.nombre} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                      {/* Etiqueta de "Urgente" */}
                    {animal.urgent && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-pulse uppercase tracking-tighter">
                        Urgente
                      </div>
                    )}
                  </div>

                  {/* CUERPO DE LA TARJETA */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-bold text-gray-800 leading-tight">{animal.nombre}</h3>
                      {/* Dentro del map de animales en HomePage.jsx */}
                   {/* 📍 UBICACIÓN REAL DEL ANIMAL */}
                      <p className="text-gray-400 text-xs mb-4 flex items-center gap-1 font-bold italic">
                        📍 {animal.ubicacion || 'Sin ubicación'}
                      </p>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase">
                        {animal.especie}
                      </span>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-6 line-clamp-3 italic flex-1">
                      "{animal.descripcion || 'Sin descripción disponible'}"
                    </p>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                        {animal.edad} años
                      </span>
                      <Link 
                        to={`/animal/${animal.id}`} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md hover:shadow-blue-200"
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
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;