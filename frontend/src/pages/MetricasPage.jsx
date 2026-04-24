import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const MetricasPage = () => {
  const [counts, setCounts] = useState({
    usuarios_totales: 0, protectoras_activas: 0, colonias_activas: 0,
    usuarios_normales: 0, suscripciones_pro: 0, adopciones_totales: 0,
    alertas_enviadas: 0, animales_buscando: 0, solicitudes_pendientes: 0, posts_pendientes: 0
  });

  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [proUsers, setProUsers] = useState([]);
  const [loadingProUsers, setLoadingProUsers] = useState(false);

  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/superadmin/stats/global`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          setCounts({
            usuarios_totales: Number(res.data.usuarios_totales) || 0,
            protectoras_activas: Number(res.data.protectoras_activas) || 0,
            colonias_activas: Number(res.data.colonias_activas) || 0,
            usuarios_normales: Number(res.data.usuarios_normales) || 0,
            suscripciones_pro: Number(res.data.suscripciones_pro) || 0,
            adopciones_totales: Number(res.data.adopciones_totales) || 0,
            alertas_enviadas: Number(res.data.alertas_enviadas) || 0,
            animales_buscando: Number(res.data.animales_buscando) || 0,
            solicitudes_pendientes: Number(res.data.solicitudes_pendientes) || 0,
            posts_pendientes: Number(res.data.posts_pendientes) || 0
          });
        }
      } catch (err) {
        console.error("❌ Error al cargar KPIs:", err);
      }
    };
    cargarMetricas();
  }, []);

  const handleOpenProModal = async () => {
    setIsProModalOpen(true);
    setLoadingProUsers(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/superadmin/usuarios-pro`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProUsers(res.data);
    } catch (err) {
      console.error("Error al cargar usuarios Pro:", err);
      alert("No se pudo cargar la lista de suscriptores.");
    } finally {
      setLoadingProUsers(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen space-y-8 md:space-y-10 animate-fade-in">

      <header>
        <h2 className="text-2xl md:text-3xl font-black text-gray-800">Cuartel General: KPIs</h2>
        <p className="text-gray-500 font-medium text-sm md:text-base">Análisis de rendimiento y seguridad de la plataforma.</p>
      </header>

      {/* SECCIÓN 1: ECOSISTEMA */}
      <section>
        <h3 className="text-xs md:text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-8 h-px bg-blue-200"></span> 1. Ecosistema y Crecimiento
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-6">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">Usuarios Totales</p>
            <p className="text-2xl md:text-3xl font-black mt-2 text-gray-800">{counts.usuarios_totales}</p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-l-4 border-cyan-500">
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">Protectoras</p>
            <p className="text-2xl md:text-3xl font-black mt-2 text-gray-800">{counts.protectoras_activas}</p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">Colonias</p>
            <p className="text-2xl md:text-3xl font-black mt-2 text-gray-800">{counts.colonias_activas}</p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-l-4 border-indigo-400">
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">Comunidad</p>
            <p className="text-2xl md:text-3xl font-black mt-2 text-gray-800">{counts.usuarios_normales}</p>
          </div>

          {/* TARJETA PRO CLICABLE */}
          <div
            onClick={handleOpenProModal}
            className="col-span-2 sm:col-span-1 bg-gradient-to-br from-yellow-50 to-white p-4 md:p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 relative overflow-hidden cursor-pointer hover:shadow-md hover:scale-105 transition-all group"
          >
            <p className="text-[10px] md:text-xs font-bold text-yellow-600 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1">👑 Planes PRO</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">VER ➔</span>
            </p>
            <p className="text-2xl md:text-3xl font-black mt-2 text-gray-800">{counts.suscripciones_pro}</p>
            {counts.suscripciones_pro > 0 && (
              <span className="text-[10px] text-yellow-600 font-bold mt-1 tracking-tighter block">INGRESOS ACTIVOS</span>
            )}
            <div className="absolute -right-4 -bottom-6 opacity-10 text-yellow-500 text-7xl font-black group-hover:scale-110 transition-transform">★</div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: IMPACTO SOCIAL */}
      <section>
        <h3 className="text-xs md:text-sm font-black text-green-600 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-8 h-px bg-green-200"></span> 2. Impacto Social (Datos Reales)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-green-600 p-5 md:p-6 rounded-2xl text-white shadow-lg shadow-green-100 relative overflow-hidden">
            <div className="relative z-10">
              <p className="opacity-80 text-[10px] md:text-xs font-bold uppercase">Vidas Salvadas (Adopciones)</p>
              <p className="text-4xl md:text-5xl font-black mt-2">{counts.adopciones_totales}</p>
            </div>
            <span className="absolute -right-4 -bottom-4 text-white/10 text-8xl font-black italic">WIN</span>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-2xl border-2 border-green-50 shadow-sm">
            <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase">Alertas Urgentes</p>
            <p className="text-2xl md:text-3xl font-black text-green-600 mt-2">{counts.alertas_enviadas}</p>
            <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-tighter">ENVIADAS VÍA SENDGRID</p>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-2xl border-2 border-green-50 shadow-sm">
            <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase">Buscando Hogar</p>
            <p className="text-2xl md:text-3xl font-black text-green-600 mt-2">{counts.animales_buscando}</p>
            <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-tighter">ANIMALES ACTIVOS</p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: SEGURIDAD */}
      <section>
        <h3 className="text-xs md:text-sm font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-8 h-px bg-red-200"></span> 3. Seguridad y Control
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className={`p-5 md:p-6 rounded-xl border ${counts.solicitudes_pendientes > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'} transition-colors shadow-sm`}>
            <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase">Solicitudes de Rol</p>
            <p className={`text-2xl md:text-3xl font-black mt-2 ${counts.solicitudes_pendientes > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {counts.solicitudes_pendientes}
            </p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Pendientes de verificar</p>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase">Moderación Tablón</p>
            <p className="text-2xl md:text-3xl font-black text-gray-400 mt-2">{counts.posts_pendientes}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Contenido en cola</p>
          </div>
          <div className="bg-gray-900 p-5 md:p-6 rounded-xl text-white shadow-xl">
            <p className="text-yellow-500 text-[10px] md:text-xs font-black uppercase italic tracking-tighter">🛡️ Shield Active</p>
            <p className="text-xl md:text-2xl font-black mt-2">reCAPTCHA v3</p>
            <div className="w-full bg-gray-800 h-1.5 rounded-full mt-3">
              <div className="bg-yellow-500 h-1.5 rounded-full w-[90%]"></div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold">Protección Anti-Bot activada</p>
          </div>
        </div>
      </section>

      {/* MODAL USUARIOS PRO */}
      {isProModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border-t-8 border-yellow-500 flex flex-col max-h-[85vh]">

            <div className="p-4 md:p-6 border-b flex justify-between items-start gap-3 bg-yellow-50/50 rounded-t-xl">
              <div>
                <h3 className="text-lg md:text-xl font-black text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">👑</span> Suscriptores Premium
                </h3>
                <p className="text-sm text-yellow-700 font-medium">Directorio de cuentas con facturación activa</p>
              </div>
              <button
                onClick={() => setIsProModalOpen(false)}
                className="text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 p-2 rounded-full transition-colors shrink-0"
              >✕</button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto flex-1">
              {loadingProUsers ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
                </div>
              ) : proUsers.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="font-bold">Aún no hay suscriptores PRO</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {proUsers.map((user) => (
                    <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl hover:border-yellow-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold border border-yellow-200 shrink-0">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">{user.email}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full uppercase">
                              Rol: {user.role}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full uppercase flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Activo
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 font-medium sm:text-right pl-12 sm:pl-0">
                        Registrado el:<br />
                        {new Date(user.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricasPage;