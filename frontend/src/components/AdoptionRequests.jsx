import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const estadoConfig = {
  pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  aprobada:  { bg: 'bg-green-100',  text: 'text-green-800'  },
  rechazada: { bg: 'bg-red-100',    text: 'text-red-800'    },
};

const TABS = [
  { key: 'pendiente', label: 'Pendientes', emoji: '🕐' },
  { key: 'aprobada',  label: 'Aprobadas',  emoji: '✅' },
  { key: 'rechazada', label: 'Rechazadas', emoji: '❌' },
];

const AdoptionRequests = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabActiva, setTabActiva] = useState('pendiente');

  const fetchSolicitudes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/adopciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolicitudes(response.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSolicitudes(); }, []);

  const handleResponse = async (id, nuevoEstado) => {
    if (!window.confirm(`¿Estás seguro de marcar esta solicitud como ${nuevoEstado}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/adopciones/${id}`,
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSolicitudes();
    } catch (error) {
      alert("Error al procesar la solicitud");
    }
  };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-48" />
      ))}
    </div>
  );

  const filtradas = solicitudes.filter(s => s.estado === tabActiva);
  const conteo = (estado) => solicitudes.filter(s => s.estado === estado).length;

  return (
    <div>
      {/* TABS */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
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
              {tab.emoji} {tab.label}
              {count > 0 && (
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${activa ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* LISTADO */}
      {filtradas.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 italic text-sm">
            No hay solicitudes {tabActiva === 'pendiente' ? 'pendientes' : tabActiva === 'aprobada' ? 'aprobadas' : 'rechazadas'}.
          </p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {filtradas.map((solicitud) => {
            const badge = estadoConfig[solicitud.estado] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
            return (
              <div key={solicitud.id} className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition">

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4 border-b pb-3">
                  <div>
                    <h4 className="font-bold text-base md:text-lg text-gray-800">
                      Interesado en: <span className="text-blue-600">{solicitud.animal_nombre}</span>
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Recibido el: {new Date(solicitud.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shrink-0 ${badge.bg} ${badge.text}`}>
                    {solicitud.estado}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-bold text-gray-700 mb-2 border-b border-gray-100 pb-1 text-xs uppercase tracking-wide">👤 Datos de Contacto</h5>
                    <ul className="space-y-1.5 text-xs md:text-sm">
                      <li><span className="text-gray-500">Email:</span> {solicitud.solicitante_email}</li>
                      <li><span className="text-gray-500">Teléfono:</span> {solicitud.telefono || 'No indicado'}</li>
                      <li><span className="text-gray-500">Ciudad:</span> {solicitud.direccion || 'No indicada'}</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-700 mb-2 border-b border-gray-100 pb-1 text-xs uppercase tracking-wide">🏡 Perfil del Hogar</h5>
                    <ul className="space-y-1.5 text-xs md:text-sm">
                      <li>
                        <span className="text-gray-500">Jardín/Exterior:</span>{' '}
                        <span className={solicitud.tiene_jardin ? 'text-green-600 font-bold' : 'text-gray-600'}>
                          {solicitud.tiene_jardin ? 'SÍ ✅' : 'NO ❌'}
                        </span>
                      </li>
                      <li>
                        <span className="text-gray-500">Otros animales:</span>{' '}
                        <span className="italic text-gray-600">{solicitud.otros_animales || 'Ninguno'}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 bg-blue-50 p-3 rounded-lg text-gray-700 text-xs md:text-sm italic border-l-4 border-blue-300">
                  "{solicitud.mensaje}"
                </div>

                {solicitud.estado === 'pendiente' && (
                  <div className="mt-4 flex flex-col sm:flex-row gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleResponse(solicitud.id, 'aprobada')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-bold text-sm shadow-sm transition active:scale-95"
                    >
                      ✅ Aprobar
                    </button>
                    <button
                      onClick={() => handleResponse(solicitud.id, 'rechazada')}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-bold text-sm shadow-sm transition active:scale-95"
                    >
                      ❌ Rechazar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdoptionRequests;