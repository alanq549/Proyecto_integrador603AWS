//perfil/client
import { useState, useEffect } from "react";
import PerfilBase from "./PerfilBase";
import { toast } from "react-toastify";

interface UsuarioAPI {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  apellido_paterno?: string; // <- AÑADIR
  apellido_materno?: string; // <- AÑADIR
  imagenPerfil?: string;
  acercaDe?: string;
  isAdmin?: boolean;
}

const ClientPerfil = () => {
  const [usuario, setUsuario] = useState<UsuarioAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

        const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = userData?.id;

        if (!userId) {
          setError("No se encontró el ID del usuario.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/profile/${userId}`
        );

        if (response.ok) {
          const data = await response.json();
          setUsuario({
            ...data,
            id: data.id_usuario, // Aquí mapeas el campo que te da el backend a lo que tú usas
          });
        } else {
          toast.error("No se pudo obtener el perfil del usuario");
            console.log(error)
        }
      } catch {
        toast.error("Hubo un error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Skeleton del encabezado */}
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-gray-200 rounded-full w-48 dark:bg-gray-700"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-32 dark:bg-gray-700"></div>
        </div>

        {/* Skeleton de la tarjeta de perfil */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 dark:bg-gray-800">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
              {/* Skeleton de la imagen */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </div>

              {/* Skeleton de la información */}
              <div className="w-full space-y-4">
                <div className="h-8 bg-gray-200 rounded-full w-3/4 dark:bg-gray-700"></div>
                <div className="h-6 bg-gray-200 rounded-full w-24 dark:bg-gray-700"></div>
                
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                  <div className="h-4 bg-gray-200 rounded w-48 dark:bg-gray-700"></div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 dark:bg-gray-700"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full dark:bg-gray-700"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 dark:bg-gray-700"></div>
                </div>
              </div>
            </div>

            {/* Skeleton de vehículos (solo para clientes) */}
            {!usuario?.isAdmin && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-48 dark:bg-gray-700"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded-lg w-40 dark:bg-gray-700"></div>
                </div>

                {/* Skeleton de lista de vehículos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-5 bg-white dark:bg-gray-800 dark:border-gray-700">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
                        </div>
                        <div className="space-y-3 w-full">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                            <div className="h-4 bg-gray-200 rounded w-16 dark:bg-gray-700"></div>
                            <div className="h-4 bg-gray-200 rounded w-24 dark:bg-gray-700"></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                            <div className="h-4 bg-gray-200 rounded w-16 dark:bg-gray-700"></div>
                            <div className="h-4 bg-gray-200 rounded w-32 dark:bg-gray-700"></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                            <div className="h-4 bg-gray-200 rounded w-16 dark:bg-gray-700"></div>
                            <div className="h-4 bg-gray-200 rounded w-20 dark:bg-gray-700"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
if (error) return <div className="p-6 text-red-600 dark:text-red-400">{error}</div>;

if (!usuario) return <div className="p-6 text-gray-600 dark:text-gray-400">No se encontró información del usuario</div>;

  // Adaptar datos para PerfilBase
  return (
    <PerfilBase
      id={usuario.id}
      nombre={usuario.nombre}
      correo={usuario.email}
      rol={usuario.rol}
      apellido_paterno={usuario.apellido_paterno} // <- AÑADIR
      apellido_materno={usuario.apellido_materno} // <- AÑADIR
      imagenPerfil={usuario.imagenPerfil}
      acercaDe={usuario.acercaDe}
      isAdmin={usuario.isAdmin}
    />
  );
};

export default ClientPerfil;
