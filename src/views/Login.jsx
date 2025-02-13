import { createRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const emailRef = createRef();
  const passwordRef = createRef();
  const [errores, setErrores] = useState({});
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
    <div
      className="flex flex-col md:flex-row h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/login.png')", // Reemplaza con la ruta de tu imagen
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Left Column */}
      <div className="md:w-1/2 w-full text-white flex flex-col justify-center items-center h-full bg-opacity-60 bg-black">
        <h1 className="text-5xl font-bold mb-4 text-center">Software de Gestión Setasplast</h1>
        <p className="text-lg text-center max-w-md">
          Optimiza y gestiona los procesos de tu empresa con nuestra solución.
        </p>
      </div>

      {/* Right Column */}
      <div className="md:w-1/2 w-full flex items-center justify-center h-full bg-opacity-60 bg-black">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Iniciar Sesión
          </h2>
          <form onSubmit={handleSubmit} noValidate>
            {errores.general && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-500 text-sm text-center rounded">
                {errores.general}
              </div>
            )}
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Usuario
              </label>
              <input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring ${
                  errores.email ? "border-red-500" : "border-gray-300"
                }`}
                ref={emailRef}
              />
              {errores.email && (
                <small className="text-red-500">{errores.email}</small>
              )}
            </div>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring ${
                  errores.password ? "border-red-500" : "border-gray-300"
                }`}
                ref={passwordRef}
              />
              {errores.password && (
                <small className="text-red-500">{errores.password}</small>
              )}
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Iniciar Sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
