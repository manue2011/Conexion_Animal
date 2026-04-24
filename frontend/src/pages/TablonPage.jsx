import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TablonPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isLoggedIn = token && user;

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
      await axios.post(`${API_URL}/api/posts`, nuevoPost, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNuevoPost({ titulo: '', contenido: '', categoria: 'donacion', codigo_postal: '' });
      setMostrarFormulario(false);
      setMensajeExito("¡Publicación enviada! Aparecerá cuando sea aprobada.");
      setTimeout(() => setMensajeExito(''), 5000);
    } catch (err) {
      alert("Error al enviar la publicación.");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-8">

      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tablón de Ayuda</h1>
        {isLoggedIn ? (
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className={`${mostrarFormulario ? 'bg-red-500' : 'bg-blue-600'} text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition shadow-md self-start sm:self-auto text-sm`}
          >
            {mostrarFormulario ? '❌ Cancelar' : '+ Nueva Publicación'}
          </button>
        ) : (
          <Link to="/login" className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 border border-gray-300 text-sm self-start sm:self-auto">
            🔑 Entra para publicar
          </Link>
        )}
      </div>

      {/* MENSAJE DE ÉXITO */}
      {mensajeExito && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-sm">
          <p className="font-bold text-sm">✅ {mensajeExito}</p>
        </div>
      )}

      {/* AVISO INVITADOS */}
      {!isLoggedIn && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
          <p className="text-blue-700 text-sm">
            <strong>¿Quieres participar?</strong> Debes estar logueado para publicar.{' '}
            <Link to="/register" className="underline font-bold">Crea tu cuenta</Link>.
          </p>
        </div>
      )}

      {/* FORMULARIO */}
      {isLoggedIn && mostrarFormulario && (
        <div className="bg-white p-5 md:p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
          <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800">¿En qué podemos ayudarnos?</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text" required placeholder="Título (Ej: Busco mantas para colonia)"
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={nuevoPost.titulo}
              onChange={(e) => setNuevoPost({ ...nuevoPost, titulo: e.target.value })}
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="w-full sm:flex-1 rounded-lg border border-gray-300 p-3 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                value={nuevoPost.categoria}
                onChange={(e) => setNuevoPost({ ...nuevoPost, categoria: e.target.value })}
              >
                <option value="donacion">🎁 Donación</option>
                <option value="voluntario">🤝 Voluntariado</option>
                <option value="hogar_temporal">🏠 Hogar Temporal</option>
              </select>

              <input
                type="text" maxLength="5" required placeholder="C.P. (Ej: 28001)"
                className="w-full sm:w-32 rounded-lg border border-gray-300 p-3 text-sm text-center outline-none focus:ring-2 focus:ring-blue-500"
                value={nuevoPost.codigo_postal}
                onChange={(e) => setNuevoPost({ ...nuevoPost, codigo_postal: e.target.value.replace(/\D/g, '') })}
              />
            </div>

            <textarea
              required rows="4" placeholder="Describe tu petición o ayuda..."
              className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={nuevoPost.contenido}
              onChange={(e) => setNuevoPost({ ...nuevoPost, contenido: e.target.value })}
            />

            <button type="submit" className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 w-full font-bold shadow-md transition-all active:scale-95 text-sm md:text-base">
              🚀 Enviar a revisión
            </button>
          </form>
        </div>
      )}

      {/* LISTADO */}
      {loading ? (
        <p className="text-center text-gray-500 italic py-10">Cargando anuncios...</p>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 italic">Aún no hay publicaciones aprobadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {posts.map((post) => (
            <div key={post.id} className={`flex flex-col p-4 md:p-5 rounded-xl shadow-md border-2 transition-transform hover:scale-[1.02] ${post.prioridad === 'destacado' ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-white'}`}>

              <div className="mb-3">
                {post.prioridad === 'destacado' && (
                  <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full mb-2 inline-block">⭐ DESTACADO</span>
                )}
                <h2 className="text-base md:text-xl font-bold text-gray-800 leading-tight">{post.titulo}</h2>
                <div className="flex flex-wrap gap-2 items-center mt-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">{post.categoria.replace('_', ' ')}</span>
                  {post.codigo_postal && (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">📍 CP: {post.codigo_postal}</span>
                  )}
                </div>
                {post.plan_autor === 'pro' && (
                  <span className="inline-flex items-center bg-blue-100 text-blue-600 text-[9px] font-black px-1 py-0.5 rounded shadow-sm border border-blue-200 animate-pulse tracking-tighter mt-2">
                    🛡️ VERIFICADO
                  </span>
                )}
              </div>

              <p className="text-gray-700 text-xs md:text-sm mb-4 flex-1 italic line-clamp-4">"{post.contenido}"</p>

              <div className="mt-auto pt-4 border-t border-gray-100 bg-gray-50 -mx-4 md:-mx-5 -mb-4 md:-mb-5 p-4 rounded-b-xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Publicado por</p>
                <div className="space-y-1 text-xs text-gray-700">
                  <p className="flex items-center gap-2">
                    <span>👤</span>
                    <span className="font-bold truncate">{post.nombre_autor || post.autor_email}</span>
                  </p>
                  {post.autor_telefono && (
                    <p className="flex items-center gap-2">
                      <span>📞</span>
                      <a href={`tel:${post.autor_telefono}`} className="text-blue-600 font-bold hover:underline">{post.autor_telefono}</a>
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