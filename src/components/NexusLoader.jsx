export default function NexusLoader({ text = "Cargando datos del dashboard..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">

      <div className="relative w-28 h-28 mb-6">

        {/* Halo exterior */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 blur-xl opacity-20 animate-pulse"></div>

        {/* Anillo animado */}
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent 
        bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 
        animate-spin-slow mask-ring"></div>

        {/* Centro */}
        <div className="absolute inset-4 flex items-center justify-center bg-white rounded-full shadow-md">
          <span className="text-indigo-600 font-bold text-lg tracking-widest">
            Nexus
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-600 font-medium tracking-wide mb-2">
        {text}
      </p>

      {/* Barra de progreso elegante */}
      <div className="w-40 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-loading-bar"></div>
      </div>

    </div>
  );
}