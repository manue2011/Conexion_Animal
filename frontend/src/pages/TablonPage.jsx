import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TablonPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Auth
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isLoggedIn = token && user;

  // Estados para el formulario
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoPost, setNuevoPost] = useState({ titulo: '', contenido: '', categoria: 'donacion', codigo_postal: '' });
  const [mensajeExito, setMensajeExito] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/posts`); 
      setPosts(response.data);
      setLoading(false);
    } catch (err) {
      setError("No se pudieron cargar las publicaciones.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); 
      if (!token) return alert("Sesión expirada");

      await axios.post(
        `${API_URL}/api/posts`, 
        nuevoPost, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Reset total
      setNuevoPost({ titulo: '', contenido: '', categoria: 'donacion', codigo_postal: '' });
      setMostrarFormulario(false);
      setMensajeExito("¡Publicación enviada! Aparecerá cuando sea aprobada.");
      setTimeout(() => setMensajeExito(''), 5000);
      
    } catch (err) {
      alert("Error al enviar la publicación.");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      
      {/* CABECERA CON BOTÓN CORREGIDO */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Tablón de Ayuda</h1>
        
        {isLoggedIn ? (
          <button 
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className={`${mostrarFormulario ? 'bg-red-500' : 'bg-blue-600'} text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition shadow-md`}
          >
            {mostrarFormulario ? '❌ Cancelar' : '+ Nueva Publicación'}
          </button>
        ) : (
          <Link to="/login" className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 border border-gray-300 text-sm">
            🔑 Entra para publicar
          </Link>
        )}
      </div>

      {/* MENSAJE DE ÉXITO */}
      {mensajeExito && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-sm animate-bounce">
          <p className="font-bold">✅ {mensajeExito}</p>
        </div>
      )}

      {/* AVISO PARA INVITADOS */}
      {!isLoggedIn && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
          <p className="text-blue-700 text-sm">
            <strong>¿Quieres participar?</strong> Debes estar logueado para publicar. <Link to="/register" className="underline font-bold">Crea tu cuenta</Link>.
          </p>
        </div>
      )}

      {/* FORMULARIO ÚNICO */}
      {isLoggedIn && mostrarFormulario && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">¿En qué podemos ayudarnos?</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text" required placeholder="Título (Ej: Busco mantas para colonia)"
              className="w-full rounded-md border-gray-300 border p-2 focus:ring-blue-500"
              value={nuevoPost.titulo}
              onChange={(e) => setNuevoPost({...nuevoPost, titulo: e.target.value})}
            />
            
            <div className="flex gap-4">
              <select 
                className="flex-1 rounded-md border-gray-300 border p-2"
                value={nuevoPost.categoria}
                onChange={(e) => setNuevoPost({...nuevoPost, categoria: e.target.value})}
              >
                <option value="donacion">🎁 Donación</option>
                <option value="voluntario">🤝 Voluntariado</option>
                <option value="hogar_temporal">🏠 Hogar Temporal</option>
              </select>

              <input 
                type="text" maxLength="5" required placeholder="C.P. (Ej: 28001)"
                className="w-1/3 rounded-md border-gray-300 border p-2 text-center"
                value={nuevoPost.codigo_postal}
                onChange={(e) => setNuevoPost({...nuevoPost, codigo_postal: e.target.value.replace(/\D/g, '')})} 
              />
            </div>

            <textarea 
              required rows="4" placeholder="Describe tu petición o ayuda..."
              className="w-full rounded-md border-gray-300 border p-2"
              value={nuevoPost.contenido}
              onChange={(e) => setNuevoPost({...nuevoPost, contenido: e.target.value})}
            ></textarea>

            <button type="submit" className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 w-full font-bold shadow-md transition-all active:scale-95">
              🚀 Enviar a revisión
            </button>
          </form>
        </div>
      )}

      {/* LISTADO DE PUBLICACIONES */}
      {loading ? (
        <p className="text-center text-gray-500 italic">Cargando anuncios...</p>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 italic">Aún no hay publicaciones aprobadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className={`flex flex-col p-5 rounded-xl shadow-md border-2 transition-transform hover:scale-[1.02] ${post.prioridad === 'destacado' ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-white'}`}>
              
              <div className="mb-3">
                {post.prioridad === 'destacado' && <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full mb-2 inline-block">⭐ DESTACADO</span>}
                <h2 className="text-xl font-bold text-gray-800 leading-tight">{post.titulo}</h2>
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">{post.categoria.replace('_', ' ')}</span>
                  {post.codigo_postal && <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">📍 CP: {post.codigo_postal}</span>}
                </div>
                {post.plan_autor === 'pro' && (
                  <span 
                    title="Protectora Verificada" 
                    className="inline-flex items-center bg-blue-100 text-blue-600 text-[9px] font-black px-1 py-0.5 rounded shadow-sm border border-blue-200 animate-pulse tracking-tighter mt-2"
                  >
                    <span className="mr-0.8">🛡️</span>VERIFICADO
                  </span>
                )}
              </div>

              <p className="text-gray-700 text-sm mb-6 flex-1 italic line-clamp-4">"{post.contenido}"</p>
              
              {/* ZONA DE CONTACTO LIMPIA */}
              <div className="mt-auto pt-4 border-t border-gray-100 bg-gray-50 -mx-5 -mb-5 p-5 rounded-b-xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Publicado por</p>
                <div className="space-y-1 text-xs text-gray-700">
                  <p className="flex items-center gap-2">
                    <span>👤</span> 
                    <span className="font-bold">{post.nombre_autor || post.autor_email}</span>
                  </p>
                  {post.autor_telefono && (
                    <p className="flex items-center gap-2">
                      <span>📞</span> <a href={`tel:${post.autor_telefono}`} className="text-blue-600 font-bold hover:underline">{post.autor_telefono}</a>
                    </p>
                  )}
                </div>
                <p className="text-[9px] text-gray-400 mt-3 text-right">📅 {new Date(post.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TablonPage;