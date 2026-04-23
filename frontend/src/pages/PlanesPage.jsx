import { Link } from 'react-router-dom';

const PlanesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Planes para Protectoras</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte al volumen de tu refugio. <br/>
            <span className="font-bold text-blue-600">Las colonias felinas siempre son 100% gratuitas.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* PLAN FREE */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Plan Solidario</h2>
              <p className="text-gray-500 mt-2">Para pequeñas protectoras que están empezando.</p>
              <div className="my-6">
                <span className="text-5xl font-black text-gray-900">0€</span>
                <span className="text-gray-500 font-medium"> / para siempre</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-gray-600"><span className="text-green-500 font-bold">✓</span> Hasta 20 animales activos</li>
              <li className="flex items-center gap-3 text-gray-600"><span className="text-green-500 font-bold">✓</span> 5 alertas en el tablón al mes</li>
              <li className="flex items-center gap-3 text-gray-600"><span className="text-green-500 font-bold">✓</span> Recepción de solicitudes</li>
              <li className="flex items-center gap-3 text-gray-400"><span className="text-gray-300">✗</span> Sin soporte prioritario</li>
              <li className="flex items-center gap-3 text-gray-400"><span className="text-gray-300">✗</span> Sin insignia de verificación</li>
            </ul>
            <Link to="/register" className="w-full block text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors">
              Empezar Gratis
            </Link>
          </div>

          {/* PLAN PRO */}
          <div className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-3xl p-8 shadow-2xl border border-blue-800 flex flex-col relative overflow-hidden transform md:-translate-y-4">
            <div className="absolute top-0 right-0 bg-yellow-500 text-yellow-950 text-xs font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">
              Recomendado
            </div>
            <div className="mb-6 relative z-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">Plan PRO 👑</h2>
              <p className="text-blue-200 mt-2">Sin límites para salvar tantas vidas como necesites.</p>
              <div className="my-6">
                <span className="text-5xl font-black text-white">9.99€</span>
                <span className="text-blue-300 font-medium"> / mes</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8 flex-1 relative z-10">
              <li className="flex items-center gap-3 text-blue-100"><span className="text-yellow-400 font-bold">✓</span> <strong>Animales ILIMITADOS</strong></li>
              <li className="flex items-center gap-3 text-blue-100"><span className="text-yellow-400 font-bold">✓</span> <strong>Mensajes ILIMITADOS</strong> en tablón</li>
              <li className="flex items-center gap-3 text-blue-100"><span className="text-yellow-400 font-bold">✓</span> Posicionamiento prioritario en búsquedas</li>
              <li className="flex items-center gap-3 text-blue-100"><span className="text-yellow-400 font-bold">✓</span> Insignia de Protectora Verificada</li>
              <li className="flex items-center gap-3 text-blue-100"><span className="text-yellow-400 font-bold">✓</span> Soporte VIP por WhatsApp 24/7</li>
            </ul>
            <Link to="/register" className="w-full block text-center bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-yellow-950 font-black py-3 rounded-xl transition-all shadow-lg hover:shadow-yellow-500/20 relative z-10">
              Quiero ser PRO
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PlanesPage;