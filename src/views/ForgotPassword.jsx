import { createRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function ForgotPassword() {
  const emailRef = createRef();
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const { forgotPassword } = useAuth({ middleware: 'guest' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    const ok = await forgotPassword(emailRef.current.value, setErrores);
    setEnviando(false);
    if (ok) setEnviado(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">¿Olvidaste tu contraseña?</h2>
            <p className="text-gray-600">
              Ingresa tu correo y te enviaremos un enlace para restablecerla.
            </p>
          </div>

          {enviado ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm text-center">
              Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada (y spam).
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {errores.general && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm text-center">
                  {errores.general}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-semibold" htmlFor="email">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="tucorreo@empresa.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errores.email
                        ? 'border-red-300 focus:ring-red-200 bg-red-50'
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                    }`}
                    ref={emailRef}
                  />
                </div>
                {errores.email && (
                  <p className="text-red-500 text-sm">{errores.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{enviando ? 'Enviando...' : 'Enviar enlace'}</span>
                {!enviando && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm">
              <ArrowLeft className="h-4 w-4" /> Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
