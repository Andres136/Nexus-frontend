export default function NexusLoader({ text = 'Cargando Nexus...' }) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full min-h-[300px]"
      role="status"
      aria-busy="true"
    >
      <div className="relative mb-6 w-16 h-16 flex items-center justify-center">

        {/* 🔄 Fondo que gira */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 transform rotate-45 rounded-lg animate-spin-slow"></div>

        {/* 🧊 Contenido QUIETO */}
        <div className="absolute inset-2 bg-white rounded flex items-center justify-center">
          <span className="text-indigo-600 font-bold text-lg">
            NEXUS
          </span>
        </div>

        {/* 🔄 Anillo externo girando */}
        <div className="absolute -inset-4 border border-indigo-200 rounded-full animate-spin-slow opacity-40"></div>
      </div>

      <p className="text-sm text-gray-600 tracking-wide font-medium mb-2">
        {text}
      </p>

      <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full w-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-loading-bar"></div>
      </div>
    </div>
  );
}
