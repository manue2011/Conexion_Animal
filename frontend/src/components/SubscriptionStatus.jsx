import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubscriptionStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/subscriptions/status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatus(res.data);
      } catch (err) {
        console.error("Error cargando suscripción", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) return <div className="animate-pulse h-20 bg-gray-200 rounded-lg"></div>;
  if (!status) return null;

  // Si es COLONIA, mostramos el mensaje de agradecimiento
if (status.tipoEntidad === 'colonia') {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-8 rounded-2xl shadow-sm mb-6">
      <div className="flex items-center gap-4">
        <div className="bg-green-500 p-3 rounded-full shadow-lg">
          <span className="text-2xl">🐾</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-green-800">Plan Solidario Activo</h3>
          <p className="text-green-700 font-medium">Acceso Total Gratuito</p>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-green-100">
        <p className="text-gray-600 leading-relaxed">
          En <strong>Conexión Animal</strong> sabemos que las colonias felinas no reciben ayuda económica y que vuestra labor es puramente voluntaria. 
        </p>
        <p className="mt-3 font-semibold text-green-700">
          ✨ Por eso, tu plan será gratuito para siempre y sin límites de publicación.
        </p>
      </div>
    </div>
  );
}

  // Si es PROTECTORA, mostramos la barra de progreso
  const { animals } = status.limits;
  const colorBarra = animals.percentage > 90 ? 'bg-red-500' : animals.percentage > 70 ? 'bg-orange-500' : 'bg-blue-500';

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Estado de tu Plan: <span className="uppercase text-blue-600">{status.plan}</span></h3>
        {status.plan === 'free' && (
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:scale-105 transition-transform">
            🚀 Subir a PRO
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Animales publicados</span>
            <span className="font-semibold">{animals.used} / {animals.max === null ? '∞' : animals.max}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`${colorBarra} h-2.5 rounded-full transition-all duration-1000`} 
              style={{ width: `${animals.percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;