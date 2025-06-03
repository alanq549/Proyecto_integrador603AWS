// components/Loader.tsx
import "../../styles/loader.css"; // Asegúrate de que la ruta sea correcta

// components/Loader.tsx
const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 dark:bg-gray-900 dark:bg-opacity-90 transition-colors duration-300">
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Logo con animación de pulso */}
        <div className="relative">
          <img 
            src="/log.png" 
            alt="Martinez Cargando" 
            className="h-20 w-20 animate-pulse" 
          />
          {/* Spinner personalizado */}
          <div className="absolute -inset-2 border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Texto de carga */}
        <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">
          Cargando...
        </p>
        
        {/* Barra de progreso opcional */}
        <div className="w-48 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
          <div className="bg-blue-600 h-1.5 rounded-full animate-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;