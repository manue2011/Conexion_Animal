import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AdoptadosPage = () => {
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdoptados = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/animales/adoptados`);
        setAnimales(response.data);
      } catch (error) {
        console.error("Error al cargar adoptados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdoptados();
  }, []);

  return (
    <div className="min-h-screen bg-green-50/30">

      {/* HEADER FINALES FELICES */}
      <div className="bg-gradient-to-b from-green-600 to-green-700 text-white py-12 md:py-16 px-4 text-center shadow-inner">
        <span className="text-5xl md:text-6xl block mb-4">🏡❤️</span>
        <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Finales Felices</h1>
        <p className="text-base md:text-lg max-w-2xl mx-auto opacity-90 font-medium">
          Estos peludos ya han encontrado el calor de un hogar gracias a la red de Conexión Animal y sus protectoras.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : animales.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <p className="text-5xl mb-4">🌱</p>
            <h3 className="text-xl font-bold text-gray-800">Aún estamos empezando</h3>
            <p className="text-gray-500">Pronto llenaremos esta sección de historias felices.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {animales.map((animal) => (
              <div key={animal.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative grayscale-[20%] hover:grayscale-0 transition-all duration-500">
                <div className="h-44 sm:h-52 md:h-60 w-full overflow-hidden relative">
                  <img
                    src={animal.foto_url || 'https://via.placeholder.com/400x300'}
                    alt={animal.nombre}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Etiqueta ADOPTADO al hacer hover */}
                  <div className="absolute inset-0 bg-green-900/40 flex items-center justify-center backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity">
                    <span className="bg-white text-green-700 font-black px-3 py-2 rounded-lg text-sm md:text-xl uppercase tracking-widest shadow-2xl rotate-[-10deg]">
                      ¡ADOPTADO!
                    </span>
                  </div>
                </div>
                <div className="p-3 md:p-5 text-center">
                  <h3 className="text-base md:text-xl font-bold text-gray-800 mb-1 truncate">{animal.nombre}</h3>
                  <p className="text-xs md:text-sm font-medium text-green-600 bg-green-50 inline-block px-2 md:px-3 py-1 rounded-full uppercase">
                    Felizmente en casa
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdoptadosPage;