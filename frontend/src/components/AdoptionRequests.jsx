
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AdoptionRequests = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos
  const fetchSolicitudes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/adopciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolicitudes(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  // Responder (Aprobar/Rechazar)
  const handleResponse = async (id, nuevoEstado) => {
    if(!window.confirm(`¿Estás seguro de marcar esta solicitud como ${nuevoEstado}?`)) return;

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

  if (loading) return <p className="text-gray-500">Cargando buzón...</p>;
  if (solicitudes.length === 0) return <p className="text-gray-500">No hay solicitudes pendientes.</p>;

  return (
    <div className="space-y-6">
      {solicitudes.map((solicitud) => (
        <div key={solicitud.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition">
          
          {/* CABECERA */}
          <div className="flex justify-between items-start mb-4 border-b pb-2">
            <div>
              <h4 className="font-bold text-lg text-gray-800">
                Interesado en: <span className="text-blue-600 font-extrabold">{solicitud.animal_nombre}</span>
              </h4>
              <p className="text-xs text-gray-400">Recibido el: {new Date(solicitud.created_at).toLocaleDateString()}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
              ${solicitud.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${solicitud.estado === 'aprobada' ? 'bg-green-100 text-green-800' : ''}
              ${solicitud.estado === 'rechazada' ? 'bg-red-100 text-red-800' : ''}
            `}>
              {solicitud.estado}
            </span>
          </div>

          {/* CUERPO CON 2 COLUMNAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            
            {/* Columna 1: Contacto */}
            <div>
              <h5 className="font-bold text-gray-700 mb-2 border-b border-gray-100 pb-1">👤 Datos de Contacto</h5>
              <ul className="space-y-2">
                <li><span className="text-gray-500">Email:</span> {solicitud.solicitante_email}</li>
                <li><span className="text-gray-500">Teléfono:</span> {solicitud.telefono || 'No indicado'}</li>
                <li><span className="text-gray-500">Ciudad:</span> {solicitud.direccion || 'No indicada'}</li>
              </ul>
            </div>

            {/* Columna 2: Perfil del Hogar */}
            <div>
              <h5 className="font-bold text-gray-700 mb-2 border-b border-gray-100 pb-1">🏡 Perfil del Hogar</h5>
              <ul className="space-y-2">
                <li>
                  <span className="text-gray-500">Jardín/Exterior:</span>{' '}
                  <span className={solicitud.tiene_jardin ? "text-green-600 font-bold" : "text-gray-600"}>
                    {solicitud.tiene_jardin ? 'SÍ ✅' : 'NO ❌'}
                  </span>
                </li>
                <li>
                  <span className="text-gray-500">Otros animales:</span><br/>
                  <span className="italic text-gray-600">{solicitud.otros_animales || 'Ninguno'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* MENSAJE DEL USUARIO */}
          <div className="mt-4 bg-blue-50 p-3 rounded text-gray-700 text-sm italic border-l-4 border-blue-300">
            "{solicitud.mensaje}"
          </div>

          {/* BOTONES DE ACCIÓN */}
          {solicitud.estado === 'pendiente' && (
            <div className="mt-5 flex gap-3 pt-4 border-t">
              <button 
                onClick={() => handleResponse(solicitud.id, 'aprobada')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold shadow-sm transition"
              >
                ✅ Aprobar Solicitud
              </button>
              <button 
                onClick={() => handleResponse(solicitud.id, 'rechazada')}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded font-bold shadow-sm transition"
              >
                ❌ Rechazar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdoptionRequests;