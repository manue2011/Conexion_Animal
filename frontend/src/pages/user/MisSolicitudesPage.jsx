import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const MisSolicitudesPage = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMisSolicitudes = async () => {
      try {
        const token = localStorage.getItem('token');
        // OJO: Necesitaremos crear esta ruta en el backend luego
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

  if (loading) return <div className="p-10 text-center">Cargando tus procesos... 🐾</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
        📋 Mis Procesos de Adopción
      </h1>

      {solicitudes.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border-2 border-dashed text-center">
          <p className="text-gray-500 text-lg">Aún no has enviado ninguna solicitud.</p>
          <p className="text-blue-600 font-bold mt-2">¡Ve al catálogo y encuentra a tu compañero ideal!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((s) => (
            <div key={s.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{s.animal_nombre}</h3>
                <p className="text-sm text-gray-400 font-medium">Solicitado el: {new Date(s.created_at).toLocaleDateString()}</p>
              </div>
              
              <div className="text-right">
                <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest
                  ${s.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : ''}
                  ${s.estado === 'aprobada' ? 'bg-green-100 text-green-700' : ''}
                  ${s.estado === 'rechazada' ? 'bg-red-100 text-red-700' : ''}
                `}>
                  {s.estado}
                </span>
                <p className="text-[10px] mt-2 text-gray-400 font-bold">ESTADO ACTUAL</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisSolicitudesPage;