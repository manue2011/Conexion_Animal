import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const RegisterPage = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  
  const [pin, setPin] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);

  // Efecto que resta 1 segundo cada segundo cuando estamos en el Paso 2
  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (step === 2 && timeLeft === 0) {
      setCanResend(true);
    }
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // PASO 1: Validar, ReCaptcha y Enviar
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (formData.password.length < 6) {
      return setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
    }
    if (formData.password !== formData.confirmPassword) {
      return setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
    }
    if (!executeRecaptcha) {
      return setMessage({ type: 'error', text: 'El sistema de seguridad no ha cargado. Reintenta.' });
    }

    setLoading(true);
    try {
      const recaptchaToken = await executeRecaptcha('register');
      if (!recaptchaToken) {
        setLoading(false);
        return setMessage({ type: 'error', text: 'No se pudo generar el token de seguridad.' });
      }

      await axios.post(`${API_URL}/api/auth/register`, {
        email: formData.email,
        password: formData.password,
        recaptchaToken
      });

      // Flujo Normal: Todo bien
      setMessage({ type: 'success', text: '¡Revisa tu correo! Te hemos enviado un código.' });
      setStep(2);
      setTimeLeft(300);
      setCanResend(false);

    } catch (error) {
      // MAGIA AQUÍ: Atrapamos el error 429 (Usuario intenta registrarse otra vez pero ya tiene un código activo)
      if (error.response && error.response.status === 429) {
        setMessage({ type: 'success', text: 'Ya tienes un código en tu correo. ¡Introdúcelo aquí!' });
        setStep(2); // Lo pasamos directamente a la pantalla del PIN
        // Como no sabemos exactamente cuántos segundos le quedan de los 5 min, le ponemos un estimado visual para que espere
        setTimeLeft(60); 
        setCanResend(false);
      } else {
        const errorMsg = error.response?.data?.message || 'Error al registrarse. ¿Quizás el email ya existe?';
        setMessage({ type: 'error', text: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: Verificar el PIN
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-email`, {
        email: formData.email,
        pin: pin
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      setMessage({ type: 'success', text: '¡Cuenta verificada! Entrando...' });
      
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 1500);

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'El código es incorrecto o ha caducado.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

    // REENVIAR PIN
  const handleResendPin = async () => {
    if (!canResend) return;
    setMessage(null);
    setLoading(true);

    try {
      const recaptchaToken = await executeRecaptcha('resend_pin');
      
      // Llamamos a la nueva ruta, que SOLO necesita el email y el recaptcha
      await axios.post(`${API_URL}/api/auth/resend-pin`, {
        email: formData.email,
        recaptchaToken
      });

      setMessage({ type: 'success', text: '¡Te hemos enviado un nuevo código!' });
      setTimeLeft(300); // Reiniciamos el reloj de 5 mins
      setCanResend(false); // Bloqueamos el botón temporalmente
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'No se pudo reenviar el código. Intenta de nuevo.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100 transition-all duration-300">

        {/* CABECERA */}
        <div className="text-center mb-6">
          <span className="text-4xl block mb-2 animate-bounce">🐾</span>
          <h2 className="text-2xl font-bold text-blue-600">
            {step === 1 ? 'Crear Cuenta' : 'Verifica tu Email'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1 ? 'Únete a la red de Conexión Animal' : `Código enviado a ${formData.email}`}
          </p>
        </div>

        {/* MENSAJES */}
        {message && (
          <div className={`p-3 mb-5 text-center text-white rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {message.text}
          </div>
        )}

        {/* --- PASO 1: FORMULARIO DE REGISTRO --- */}
        {step === 1 && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
              <input
                type="email"
                name="email"
                placeholder="tu@email.com"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                onChange={handleChange}
                value={formData.email}
                required
              />
               <p className="text-[11px] text-gray-400 mt-1.5 ml-1">⚠️ El sistema distingue entre mayúsculas y minúsculas.</p>
            </div>

            {/* CONTRASEÑA */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  onChange={handleChange}
                  value={formData.password}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* REPETIR CONTRASEÑA */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Repetir Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Vuelve a escribirla"
                  className={`w-full px-3 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword 
                      ? 'border-red-400 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  onChange={handleChange}
                  value={formData.confirmPassword}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-3 rounded-lg font-bold transition shadow-md mt-4 active:scale-95
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'Procesando...' : 'Registrarse'}
            </button>

            <p className="mt-5 text-center text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-blue-600 font-bold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </form>
        )}

        {/* --- PASO 2: VERIFICAR PIN --- */}
        {step === 2 && (
          <form onSubmit={handleVerifySubmit} className="space-y-5 animate-fade-in">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                Introduce el código numérico de 6 dígitos que te hemos enviado. ¡Revisa el SPAM por si acaso!
              </p>
            </div>

            <div>
              <input 
                type="text" 
                maxLength="6"
                required 
                value={pin} 
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full border border-gray-300 p-4 text-center text-3xl tracking-[0.5em] rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition font-mono font-bold text-gray-800"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || pin.length < 6}
              className={`w-full py-3 px-4 text-white font-bold rounded-lg shadow-md transition-all active:scale-95
                ${loading || pin.length < 6 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {loading ? 'Verificando...' : 'Validar y Entrar'}
            </button>

            {/* --- ZONA DEL CONTADOR Y REENVÍO --- */}
            <div className="text-center mt-4 space-y-3">
              {canResend ? (
                <button 
                  type="button" 
                  onClick={handleResendPin}
                  disabled={loading}
                  className="text-sm font-bold text-blue-600 hover:text-blue-800 underline transition"
                >
                  No he recibido el código. Reenviar ahora.
                </button>
              ) : (
                <p className="text-sm text-gray-500 font-medium">
                  Podrás solicitar otro código en <span className="text-orange-600">{formatTime(timeLeft)}</span>
                </p>
              )}

              <div>
                <button 
                  type="button"
                  onClick={() => { setStep(1); setPin(''); setMessage(null); }} 
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Me he equivocado de correo, volver atrás
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default RegisterPage;