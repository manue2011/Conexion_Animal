import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import AnimalForm from '../../components/AnimalForm';
import AnimalList from '../../components/AnimalList';
import AdoptionRequests from '../../components/AdoptionRequests';
import SubscriptionStatus from '../../components/SubscriptionStatus';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('resumen');
  const [refreshList, setRefreshList] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [animalAEditar, setAnimalAEditar] = useState(null);

  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false);
  const [isSubmittingNeed, setIsSubmittingNeed] = useState(false);
  const [needForm, setNeedForm] = useState({ titulo: '', categoria: 'comida', descripcion: '', prioridad: 'normal' });

  const [protectoraInfo, setProtectoraInfo] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [perfilForm, setPerfilForm] = useState({ descripcion: '', direccion: '', telefono: '' });

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const resProt = await axios.get(`${API_URL}/api/usuarios/mi-protectora`, config);
      setProtectoraInfo(resProt.data);
      if (resProt.data.plan) {
        setUser(prev => ({ ...prev, plan: resProt.data.plan }));
        const localUserData = JSON.parse(localStorage.getItem('user'));
        if (localUserData && localUserData.plan !== resProt.data.plan) {
          localUserData.plan = resProt.data.plan;
          localStorage.setItem('user', JSON.stringify(localUserData));
        }
      }
      setPerfilForm({
        descripcion: resProt.data.descripcion || '',
        direccion: resProt.data.direccion || '',
        telefono: resProt.data.telefono || ''
      });
    } catch (err) {
      console.error("Error cargando dashboard:", err);
    }
  }, []);

  const handleEditAnimal = (animal) => {
    setAnimalAEditar(animal);
    setActiveView('registrar'); 
  };
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token || !userData) { navigate('/login'); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'superadmin') { navigate('/'); return; }
    setUser(parsedUser);
    fetchData();
  }, [navigate, fetchData]);

  const handleUpdatePerfil = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/usuarios/protectora/${protectoraInfo.id}`, perfilForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsProfileModalOpen(false);
      fetchData();
      alert("¡Perfil de protectora completado!");
    } catch (err) {
      alert("Error al actualizar perfil");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const triggerRefresh = () => { setRefreshList(prev => !prev); };

  const handleSubmitNeed = async (e) => {
    e.preventDefault();
    if (isSubmittingNeed) return;
    setIsSubmittingNeed(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/necesidades`, { ...needForm, protectora_id: protectoraInfo.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(needForm.prioridad === 'urgente' ? '¡Alerta enviada a los voluntarios!' : 'Petición publicada correctamente.');
      setIsNeedModalOpen(false);
      setNeedForm({ titulo: '', categoria: 'comida', descripcion: '', prioridad: 'normal' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error al publicar la petición.');
    } finally {
      setIsSubmittingNeed(false);
    }
  };

  if (!user) return <div className="p-10">Cargando...</div>;

  const renderResumen = (
    <div className="animate-fade-in">
      {protectoraInfo && (!protectoraInfo.direccion || !protectoraInfo.descripcion) && (
        <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-6 rounded-r-lg shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-orange-800 text-lg">⚠️ Perfil de Protectora incompleto</h3>
            <p className="text-orange-700 text-sm">Necesitamos la dirección y descripción para habilitar la gestión de animales.</p>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg transition self-start sm:self-auto"
          >Configurar ahora</button>
        </div>
      )}
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Visión General</h2>
        <SubscriptionStatus />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm">Protectora</h3>
          <p className="text-xl font-bold text-blue-800">{protectoraInfo?.nombre || 'Cargando...'}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm">Tu Rol</h3>
          <p className="text-xl font-bold uppercase">{user.role}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm">Estado Perfil</h3>
          <p className={`text-xl font-bold ${protectoraInfo?.direccion ? 'text-green-600' : 'text-red-500'}`}>
            {protectoraInfo?.direccion ? 'Completado ✅' : 'Incompleto ❌'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 w-full overflow-x-hidden">

      {/* BOTÓN HAMBURGUESA — solo móvil */}
      <div className="md:hidden flex items-center justify-between bg-slate-800 text-white px-4 py-3">
        <h2 className="text-lg font-bold tracking-wider">
          PANEL {user.role === 'superadmin' ? 'SUPREMO' : 'ADMIN'}
        </h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white text-2xl focus:outline-none">
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:flex md:flex-col w-full md:w-64 md:min-h-screen bg-slate-800 text-white shadow-xl shrink-0 md:sticky md:top-0`}>
        <div className="p-6 text-center border-b border-slate-700 hidden md:block">
          <h2 className="text-2xl font-bold tracking-wider">
            PANEL {user.role === 'superadmin' ? 'SUPREMO' : 'ADMIN'}
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => { setActiveView('animales'); setSidebarOpen(false); }} className={`w-full text-left py-3 px-4 rounded transition flex items-center gap-3 ${activeView === 'animales' ? 'bg-blue-600' : 'hover:bg-slate-700 text-gray-300'}`}>🐾 Inventario</button>
          <button onClick={() => { setActiveView('registrar'); setSidebarOpen(false); }} className={`w-full text-left py-3 px-4 rounded transition flex items-center gap-3 ${activeView === 'registrar' ? 'bg-blue-600' : 'hover:bg-slate-700 text-gray-300'}`}>➕ Registrar Animal</button> 
          <button onClick={() => { setActiveView('resumen'); setSidebarOpen(false); }} className={`w-full text-left py-3 px-4 rounded transition flex items-center gap-3 ${activeView === 'resumen' ? 'bg-blue-600' : 'hover:bg-slate-700 text-gray-300'}`}>📊 Resumen</button>
          <button onClick={() => { setActiveView('solicitudes'); setSidebarOpen(false); }} className={`w-full text-left py-3 px-4 rounded transition flex items-center gap-3 ${activeView === 'solicitudes' ? 'bg-blue-600' : 'hover:bg-slate-700 text-gray-300'}`}>💌 Solicitudes</button>
          <button onClick={() => { setIsProfileModalOpen(true); setSidebarOpen(false); }} className="w-full text-left py-3 px-4 rounded transition flex items-center gap-3 hover:bg-slate-700 text-gray-300">⚙️ Configuración</button>
          <button onClick={() => { setIsNeedModalOpen(true); setSidebarOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg font-bold mt-4 transition shadow-md flex justify-between items-center bg-red-600 hover:bg-red-700 text-white"><span>🚨 Pedir Ayuda</span></button>
          <button onClick={() => { setActiveView('plan'); setSidebarOpen(false); }} className={`w-full text-left py-3 px-4 rounded transition flex items-center gap-3 ${activeView === 'plan' ? 'bg-blue-600' : 'hover:bg-slate-700 text-gray-300'}`}>💳 Mi Plan</button>
          {user.plan === 'pro' && (
            <button onClick={() => { setActiveView('soporte'); setSidebarOpen(false); }} className={`w-full text-left py-3 px-4 rounded transition flex items-center gap-3 mt-2 border border-yellow-500/30 ${activeView === 'soporte' ? 'bg-yellow-600 text-white' : 'bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20'}`}>
              🎧 Soporte VIP 24h
            </button>
          )}
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-4 md:p-8 w-full min-w-0">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {activeView === 'resumen' && 'Dashboard'}
            {activeView === 'animales' && 'Inventario'}
            {activeView === 'solicitudes' && 'Adopciones'}
            {activeView === 'plan' && 'Suscripción y Límites'}
            {activeView === 'soporte' && 'Soporte VIP'}
            {activeView === 'registrar' && 'Registrar Animal'}
          </h1>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow self-start sm:self-auto">
            Usuario: <span className="font-bold text-blue-600">{user.email}</span>
            {user.plan === 'pro' && (
              <span className="ml-2 inline-flex items-center bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-yellow-200 shadow-sm">
                🛡️ VERIFICADO 24H
              </span>
            )}
          </div>
        </header>

        {activeView === 'resumen' && renderResumen}

        {activeView === 'plan' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <SubscriptionStatus />
          </div>
        )}

        {activeView === 'animales' && (
          <div className="animate-fade-in">
            {!protectoraInfo?.direccion ? (
              <div className="bg-white p-10 rounded-xl shadow text-center">
                <p className="text-5xl mb-4">🚫</p>
                <h2 className="text-2xl font-bold text-gray-800">Acceso Restringido</h2>
                <p className="text-gray-500 mt-2">Debes completar la dirección de la protectora antes de subir animales.</p>
                <button onClick={() => setIsProfileModalOpen(true)} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Completar Perfil</button>
              </div>
            ) : (
             <AnimalList refreshTrigger={refreshList} setEditAnimal={handleEditAnimal} />
            )}
          </div>
        )}

          {activeView === 'registrar' && (
          <div className="animate-fade-in max-w-5xl w-full">
              {!protectoraInfo?.direccion ? (
                <div className="bg-white p-10 rounded-xl shadow text-center">
                  <p className="text-5xl mb-4">🚫</p>
                  <h2 className="text-2xl font-bold text-gray-800">Acceso Restringido</h2>
                  <p className="text-gray-500 mt-2">Debes completar la dirección de la protectora antes de subir animales.</p>
                  <button onClick={() => setIsProfileModalOpen(true)} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Completar Perfil</button>
                </div>
              ) : (
               <AnimalForm animalAEditar={animalAEditar} readOnly={animalAEditar?.estado === 'adoptado'} onSuccess={() => { triggerRefresh();  setActiveView('animales'); setAnimalAEditar(null);  }} onCancel={() => {
              setActiveView('animales'); 
              setAnimalAEditar(null);    
        }} />
              )}
            </div>
          )}

        {activeView === 'solicitudes' && (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <AdoptionRequests />
          </div>
        )}

        {activeView === 'soporte' && user.plan === 'pro' && (
          <div className="max-w-2xl mx-auto animate-fade-in bg-white p-6 md:p-8 rounded-2xl shadow-lg border-t-4 border-blue-600">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">👑</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Centro de Soporte VIP</h2>
                <p className="text-blue-600 font-medium">Prioridad Máxima Garantizada</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4">
                <div className="bg-blue-600 p-2 rounded-lg text-white">📧</div>
                <div>
                  <p className="text-xs font-bold text-blue-800 uppercase text-left">Email Prioritario</p>
                  <p className="text-blue-900 font-medium text-left">conexionanimal2028@gmail.com</p>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-4">
                <div className="bg-green-600 p-2 rounded-lg text-white">📱</div>
                <div>
                  <p className="text-xs font-bold text-green-800 uppercase text-left">WhatsApp Directo</p>
                  <p className="text-green-900 font-medium text-left">+34 600 000 000</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: CONFIGURACIÓN PROTECTORA */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Datos de la Protectora</h2>
            <form onSubmit={handleUpdatePerfil} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dirección Física</label>
                <input required type="text" value={perfilForm.direccion} onChange={(e) => setPerfilForm({ ...perfilForm, direccion: e.target.value })} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Av. de la Constitución 15, Madrid" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono de Contacto</label>
                <input required type="text" value={perfilForm.telefono} onChange={(e) => setPerfilForm({ ...perfilForm, telefono: e.target.value })} className="w-full border p-2.5 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción / Historia</label>
                <textarea required value={perfilForm.descripcion} onChange={(e) => setPerfilForm({ ...perfilForm, descripcion: e.target.value })} className="w-full border p-2.5 rounded-lg h-32 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cuenta algo sobre vuestra asociación..." />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PEDIR AYUDA */}
      {isNeedModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[70] backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg border-t-8 border-red-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🚨 Publicar Petición de Ayuda</h2>
            <p className="text-sm text-gray-500 mb-6">Informa a la red de lo que necesita vuestra protectora.</p>
            <form onSubmit={handleSubmitNeed} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título corto</label>
                <input type="text" required maxLength="50" value={needForm.titulo} onChange={(e) => setNeedForm({ ...needForm, titulo: e.target.value })} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-red-500" placeholder="Ej: Necesitamos mantas para el invierno" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
                <select value={needForm.categoria} onChange={(e) => setNeedForm({ ...needForm, categoria: e.target.value })} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-red-500 bg-white">
                  <option value="comida">🥫 Comida / Pienso</option>
                  <option value="medicina">💊 Medicina / Veterinaria</option>
                  <option value="transporte">🚐 Transporte / Ayuda logística</option>
                  <option value="urgencia">🆘 Urgencia / Rescate extremo</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Detalles de la situación</label>
                <textarea required value={needForm.descripcion} onChange={(e) => setNeedForm({ ...needForm, descripcion: e.target.value })} className="w-full border border-gray-300 p-2.5 rounded-lg h-24 outline-none focus:ring-2 focus:ring-red-500" placeholder="Explica qué está pasando y cómo pueden ayudar..."></textarea>
              </div>
              <div className="flex items-center bg-red-50 p-4 rounded-xl border border-red-100">
                <input type="checkbox" id="urgente_prot" checked={needForm.prioridad === 'urgente'} onChange={(e) => setNeedForm({ ...needForm, prioridad: e.target.checked ? 'urgente' : 'normal' })} className="h-5 w-5 text-red-600 rounded cursor-pointer" />
                <label htmlFor="urgente_prot" className="ml-3 block text-sm font-bold text-red-800 cursor-pointer">
                  ⚠️ Marcar como EMERGENCIA EXTREMA
                  <span className="block text-xs font-normal text-red-600 mt-0.5">Se enviará una alerta masiva a los voluntarios.</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsNeedModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                <button type="submit" disabled={isSubmittingNeed} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition">
                  {isSubmittingNeed ? 'Publicando...' : 'Publicar Alerta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;