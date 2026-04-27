import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const estadoConfig = {
  pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  aprobada:  { bg: 'bg-green-100',  text: 'text-green-700'  },
  rechazada: { bg: 'bg-red-100',    text: 'text-red-700'    },
};

const TABS = [
  { key: 'pendiente', label: 'Pendientes', emoji: '🕐' },
  { key: 'aprobada',  label: 'Aprobadas',  emoji: '✅' },
  { key: 'rechazada', label: 'Rechazadas', emoji: '❌' },
];

const MisSolicitudesPage = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabActiva, setTabActiva] = useState('pendiente');

  useEffect(() => {
    const fetchMisSolicitudes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/adopciones/mis-solicitudes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSolicitudes(res.data);
      } catch (err) {
        console.error("Error al cargar tus solicitudes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMisSolicitudes();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
      Cargando tus procesos... 🐾
    </div>
  );

  const filtradas = solicitudes.filter(s => s.estado === tabActiva);
  const conteo = (estado) => solicitudes.filter(s => s.estado === estado).length;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:py-10">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-2xl md:text-3xl font-black text-gray-800 mb-6 md:mb-8 flex items-center gap-3">
          📋 Mis Procesos de Adopción
        </h1>

        {solicitudes.length === 0 ? (
          <div className="bg-white p-8 md:p-10 rounded-2xl border-2 border-dashed text-center">
            <p className="text-gray-500 text-base md:text-lg">Aún no has enviado ninguna solicitud.</p>
            <p className="text-blue-600 font-bold mt-2 text-sm md:text-base">¡Ve al catálogo y encuentra a tu compañero ideal!</p>
          </div>
        ) : (
          <>
            {/* TABS */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto pb-0">
              {TABS.map(tab => {
                const count = conteo(tab.key);
                const activa = tabActiva === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setTabActiva(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-all -mb-px
                      ${activa
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <span>{tab.emoji} {tab.label}</span>
                    {count > 0 && (
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${activa ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* LISTADO FILTRADO */}
            {filtradas.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border-2 border-dashed text-center">
                <p className="text-gray-400 italic text-sm">No tienes solicitudes {tabActiva === 'pendiente' ? 'pendientes' : tabActiva === 'aprobada' ? 'aprobadas' : 'rechazadas'}.</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4 max-h-[65vh] md:max-h-[600px] overflow-y-auto pr-2">
                {filtradas.map((s) => {
                  const config = estadoConfig[s.estado] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
                  return (
                    <div
                      key={s.id}
                      className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                    >
                      <div>
                        <h3 className="text-base md:text-xl font-bold text-gray-800">{s.animal_nombre}</h3>
                        <p className="text-xs md:text-sm text-gray-400 font-medium mt-0.5">
                          Solicitado el: {new Date(s.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                        <span className={`px-3 md:px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${config.bg} ${config.text}`}>
                          {s.estado}
                        </span>
                        <p className="text-[10px] sm:mt-2 text-gray-400 font-bold">ESTADO ACTUAL</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MisSolicitudesPage;