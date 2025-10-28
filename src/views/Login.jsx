import { createRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const emailRef = createRef();
  const passwordRef = createRef();
  const [errores, setErrores] = useState({});
  const [mostrarPassword, setMostrarPassword] = useState(false);
  
  const { login } = useAuth({
    middleware: "guest",
    url: "/admin/users",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };
    login(data, setErrores);
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* ✨ Left Panel - Mejorado con gradientes */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-800 opacity-95"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-12"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white to-transparent transform skew-y-12"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-white to-blue-200 rounded-full flex items-center justify-center mb-6 shadow-2xl">
              <span className="text-2xl font-bold text-blue-900">N</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Nexus
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-blue-100 text-center max-w-md leading-relaxed mb-8">
            Optimiza y gestiona los procesos de tu empresa con nuestra solución integral
          </p>

          {/* Features */}
          <div className="space-y-4 text-blue-100">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              <span>Gestión de inventario en tiempo real</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
              <span>Reportes y análisis avanzados</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-red-400 rounded-full"></div>
              <span>Control total de tu negocio</span>
            </div>
          </div>
        </div>
      </div>

      {/* ✨ Right Panel - Form mejorado */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Nexus
            </h1>
          </div>

          {/* Form Container */}
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Bienvenido
              </h2>
              <p className="text-gray-600">Inicia sesión para continuar</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Error General */}
              {errores.general && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 rounded-xl text-sm text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <span>⚠️</span>
                    <span>{errores.general}</span>
                  </div>
                </div>
              )}

              {/* Usuario Input */}
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-semibold" htmlFor="username">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errores.email 
                        ? "border-red-300 focus:ring-red-200 bg-red-50" 
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"
                    }`}
                    ref={emailRef}
                  />
                </div>
                {errores.email && (
                  <p className="text-red-500 text-sm flex items-center space-x-1">
                    <span>•</span>
                    <span>{errores.email}</span>
                  </p>
                )}
              </div>

              {/* Contraseña Input */}
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-semibold" htmlFor="password">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={mostrarPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errores.password 
                        ? "border-red-300 focus:ring-red-200 bg-red-50" 
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"
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
                {errores.password && (
                  <p className="text-red-500 text-sm flex items-center space-x-1">
                    <span>•</span>
                    <span>{errores.password}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span>Iniciar Sesión</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                ¿Problemas para acceder?{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Contacta soporte
                </a>
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              © 2024 Nexus. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}