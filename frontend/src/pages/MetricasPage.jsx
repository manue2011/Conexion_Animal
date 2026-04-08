import { useState, useEffect } from 'react';
import axios from 'axios';

const MetricasPage = () => {
  const [counts, setCounts] = useState({
    usuarios_totales: 0,
    protectoras_activas: 0,
    colonias_activas: 0
  });

  useEffect(() => {
  const cargarMetricas = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/superadmin/stats/global', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("📥 Respuesta del servidor:", res.data); // MIRA ESTO EN LA CONSOLA (F12)

      if (res.data) {
        setCounts({
          usuarios_totales: Number(res.data.usuarios_totales) || 0,
          protectoras_activas: Number(res.data.protectoras_activas) || 0,
          colonias_activas: Number(res.data.colonias_activas) || 0
        });
      }
    } catch (err) {
      console.error("❌ Error al cargar KPIs:", err.response?.data || err.message);
    }
  };
  cargarMetricas();
}, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Métricas Globales</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta Usuarios */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-xs font-bold text-gray-400 uppercase">Usuarios Totales</p>
          <p className="text-3xl font-black mt-2">{counts.usuarios_totales}</p>
        </div>

        {/* Tarjeta Protectoras */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-xs font-bold text-gray-400 uppercase">Protectoras Activas</p>
          <p className="text-3xl font-black mt-2">{counts.protectoras_activas}</p>
        </div>

        {/* Tarjeta Colonias */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
          <p className="text-xs font-bold text-gray-400 uppercase">Colonias Activas</p>
          <p className="text-3xl font-black mt-2">{counts.colonias_activas}</p>
        </div>
      </div>
    </div>
  );
};