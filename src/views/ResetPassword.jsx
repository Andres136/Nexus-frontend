import { createRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const passwordRef = createRef();
  const passwordConfirmRef = createRef();
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const { resetPassword } = useAuth({ middleware: 'guest' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    const ok = await resetPassword(
      {
        token,
        email,
        password: passwordRef.current.value,
        password_confirmation: passwordConfirmRef.current.value,
      },
      setErrores
    );
    setEnviando(false);
    if (ok) navigate('/', { replace: true });
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Enlace inválido</h2>
          <p className="text-gray-600">
            Este enlace de restablecimiento no es válido o ya expiró. Solicita uno nuevo.
          </p>
          <Link to="/olvide-password" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm">
            <ArrowLeft className="h-4 w-4" /> Solicitar un nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Restablecer contraseña</h2>
            <p className="text-gray-600">Elige una nueva contraseña para {email}</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {errores.general && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm text-center">
                {errores.general}
              </div>
            )}
            {errores.email && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm text-center">
                {errores.email}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-semibold" htmlFor="password">
                Nueva contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errores.password
                      ? 'border-red-300 focus:ring-red-200 bg-red-50'
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                  }`}
                  ref={passwordRef}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {mostrarPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errores.password && <p className="text-red-500 text-sm">{errores.password}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-semibold" htmlFor="password_confirmation">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password_confirmation"
                  type={mostrarPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="Repite la contraseña"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                  ref={passwordConfirmRef}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{enviando ? 'Guardando...' : 'Restablecer contraseña'}</span>
              {!enviando && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>

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
