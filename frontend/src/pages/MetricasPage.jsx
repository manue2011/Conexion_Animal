  import { useState, useEffect } from 'react';
import axios from 'axios';

const MetricasPage = () => {
  const [counts, setCounts] = useState({
// 1. Ecosistema
  usuarios_totales: 0,
  protectoras_activas: 0,
  colonias_activas: 0,
  usuarios_normales: 0,
  // 2. Impacto
  adopciones_totales: 0,
  alertas_enviadas: 0,
  animales_buscando: 0,
  // 3. Seguridad
  solicitudes_pendientes: 0,
  posts_pendientes: 0
  });

  useEffect(() => {
  const cargarMetricas = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/superadmin/stats/global', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data) {
        // AGREGAMOS LOS CAMPOS QUE FALTAN AQUÍ:
        setCounts({
          usuarios_totales: Number(res.data.usuarios_totales) || 0,
          protectoras_activas: Number(res.data.protectoras_activas) || 0,
          colonias_activas: Number(res.data.colonias_activas) || 0,
          usuarios_normales: Number(res.data.usuarios_normales) || 0,
          adopciones_totales: Number(res.data.adopciones_totales) || 0, // <-- NUEVO
          alertas_enviadas: Number(res.data.alertas_enviadas) || 0,     // <-- NUEVO
          animales_buscando: Number(res.data.animales_buscando) || 0,   // <-- NUEVO
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

  return (
  <div className="p-8 bg-gray-50 min-h-screen space-y-10 animate-fade-in">
    <header>
      <h2 className="text-3xl font-black text-gray-800">Cuartel General: KPIs</h2>
      <p className="text-gray-500 font-medium">Análisis de rendimiento y seguridad de la plataforma.</p>
    </header>

    {/* SECCIÓN 1: ECOSISTEMA SaaS */}
    <section>
      <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="w-8 h-px bg-blue-200"></span> 1. Ecosistema y Crecimiento
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-xs font-bold text-gray-400 uppercase">Usuarios Totales</p>
          <p className="text-3xl font-black mt-2 text-gray-800">{counts.usuarios_totales}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-cyan-500">
          <p className="text-xs font-bold text-gray-400 uppercase">Protectoras</p>
          <p className="text-3xl font-black mt-2 text-gray-800">{counts.protectoras_activas}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
          <p className="text-xs font-bold text-gray-400 uppercase">Colonias</p>
          <p className="text-3xl font-black mt-2 text-gray-800">{counts.colonias_activas}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-400">
          <p className="text-xs font-bold text-gray-400 uppercase">Comunidad</p>
          <p className="text-3xl font-black mt-2 text-gray-800">{counts.usuarios_normales}</p>
        </div>
      </div>
    </section>

    {/* SECCIÓN 2: IMPACTO SOCIAL */}
    <section>
      <h3 className="text-sm font-black text-green-600 uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="w-8 h-px bg-green-200"></span> 2. Impacto Social (Datos Reales)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-600 p-6 rounded-2xl text-white shadow-lg shadow-green-100 relative overflow-hidden">
          <div className="relative z-10">
            <p className="opacity-80 text-xs font-bold uppercase">Vidas Salvadas (Adopciones)</p>
            <p className="text-5xl font-black mt-2">{counts.adopciones_totales}</p>
          </div>
          <span className="absolute -right-4 -bottom-4 text-white/10 text-8xl font-black italic">WIN</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border-2 border-green-50 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase">Alertas Urgentes</p>
          <p className="text-3xl font-black text-green-600 mt-2">{counts.alertas_enviadas}</p>
          <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-tighter">ENVIADAS VÍA SENDGRID</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border-2 border-green-50 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase">Buscando Hogar</p>
          <p className="text-3xl font-black text-green-600 mt-2">{counts.animales_buscando}</p>
          <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-tighter">ANIMALES ACTIVOS</p>
        </div>
      </div>
    </section>

    {/* SECCIÓN 3: GOBERNANZA Y SEGURIDAD */}
    <section>
      <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="w-8 h-px bg-red-200"></span> 3. Seguridad y Control
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl border ${counts.solicitudes_pendientes > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'} transition-colors shadow-sm`}>
          <p className="text-gray-500 text-xs font-bold uppercase">Solicitudes de Rol</p>
          <p className={`text-3xl font-black mt-2 ${counts.solicitudes_pendientes > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {counts.solicitudes_pendientes}
          </p>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Pendientes de verificar</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase">Moderación Tablón</p>
          <p className="text-3xl font-black text-gray-400 mt-2">{counts.posts_pendientes}</p>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Contenido en cola</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl text-white shadow-xl">
          <p className="text-yellow-500 text-xs font-black uppercase italic tracking-tighter">🛡️ Shield Active</p>
          <p className="text-2xl font-black mt-2">reCAPTCHA v3</p>
          <div className="w-full bg-gray-800 h-1.5 rounded-full mt-3">
             <div className="bg-yellow-500 h-1.5 rounded-full w-[90%]"></div>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold">Protección Anti-Bot activada</p>
        </div>
      </div>
    </section>
  </div>
  );
};
export default MetricasPage;