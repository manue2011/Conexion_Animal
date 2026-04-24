import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SubscriptionStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/subscriptions/status`, {
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

  const handleUpgradePro = async () => {
    setIsProcessingPayment(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/subscriptions/create-checkout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        throw new Error("No se recibió la URL de pago");
      }
    } catch (err) {
      console.error("Error al conectar con Stripe:", err);
      alert("Hubo un error al iniciar el proceso de pago. Por favor, inténtalo de nuevo.");
      setIsProcessingPayment(false);
    }
  };

  if (loading) return <div className="animate-pulse h-16 bg-gray-200 rounded-lg mb-6" />;
  if (!status) return null;

  // COLONIA — Plan Solidario
  if (status.tipoEntidad === 'colonia') {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-5 md:p-8 rounded-2xl shadow-sm mb-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="bg-green-500 p-2.5 md:p-3 rounded-full shadow-lg shrink-0">
            <span className="text-xl md:text-2xl">🐾</span>
          </div>
          <div>
            <h3 className="text-base md:text-xl font-bold text-green-800">Plan Solidario Activo</h3>
            <p className="text-sm text-green-700 font-medium">Acceso Total Gratuito</p>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-green-100 space-y-2">
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            En <strong>Conexión Animal</strong> sabemos que las colonias felinas no reciben ayuda económica y que vuestra labor es puramente voluntaria.
          </p>
          <p className="text-sm font-semibold text-green-700">
            ✨ Tu plan será gratuito para siempre y sin límites de publicación.
          </p>
        </div>
      </div>
    );
  }

  // PROTECTORA — Barra de progreso
  const { animals } = status.limits;
  const colorBarra = animals.percentage > 90
    ? 'bg-red-500'
    : animals.percentage > 70
      ? 'bg-orange-500'
      : 'bg-blue-500';

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border mb-6">

      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
        <h3 className="text-base md:text-lg font-bold text-gray-800">
          Plan actual: <span className="uppercase text-blue-600">{status.plan}</span>
        </h3>
        {status.plan === 'free' && (
          <button
            onClick={handleUpgradePro}
            disabled={isProcessingPayment}
            className={`self-start sm:self-auto px-4 py-2 rounded-lg font-bold text-white text-sm transition-all
              ${isProcessingPayment
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 shadow-md'
              }`}
          >
            {isProcessingPayment ? 'Conectando...' : '🚀 Subir a PRO'}
          </button>
        )}
      </div>

      <div className="space-y-4">

        {/* BARRA ANIMALES */}
        <div>
          <div className="flex justify-between text-xs md:text-sm mb-1">
            <span className="text-gray-600">Animales publicados</span>
            <span className="font-semibold">{animals.used} / {animals.max === null ? '∞' : animals.max}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={`${colorBarra} h-2.5 rounded-full transition-all duration-1000`} style={{ width: `${animals.percentage}%` }} />
          </div>
        </div>

        {/* BARRA MENSAJES */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between text-xs md:text-sm mb-1">
            <span className="text-gray-600 font-medium">Mensajes en el tablón</span>
            <span className="font-bold">{status.limits.messages.used} / {status.limits.messages.max || '∞'}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-1000 ${status.limits.messages.percentage > 80 ? 'bg-orange-500' : 'bg-purple-500'}`}
              style={{ width: `${status.limits.messages.percentage}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 italic">
            * Incluye anuncios de donaciones, voluntarios y hogar temporal.
          </p>
        </div>

        {/* GRID FEATURES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
            <h4 className="font-bold text-gray-700 mb-2 text-xs uppercase tracking-wider">Incluido en tu plan:</h4>
            <ul className="space-y-1.5">
              {status.features?.map((f, i) => (
                <li key={i} className="text-xs md:text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-green-500 font-bold shrink-0">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>

          {status.plan === 'free' && (
            <div className="bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-2 text-xs uppercase tracking-wider">¿Por qué ser PRO?</h4>
              <ul className="space-y-1.5 text-xs md:text-sm text-blue-700">
                <li className="flex items-start gap-2">⭐ <span><strong>Sin límites:</strong> Publica todo lo que necesites.</span></li>
                <li className="flex items-start gap-2">⭐ <span><strong>Prioridad:</strong> Tus animales salen antes.</span></li>
                <li className="flex items-start gap-2">⭐ <span><strong>Soporte 24/7:</strong> Asistencia constante.</span></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;