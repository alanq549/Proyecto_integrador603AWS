import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useTheme } from '../../components/common/ThemeContext'; // ajuste según tu estructura

import "react-toastify/dist/ReactToastify.css";
import {
  FaCar,
  FaCarSide,
  FaCogs,
  FaCalendarAlt,
  FaHashtag,
  FaPalette,
  FaUserEdit,
  FaUserCircle,
  FaEnvelope,
  FaInfoCircle,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

type PerfilBaseProps = {
  id: number;
  nombre: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  correo: string;
  rol: string;
  imagenPerfil?: string;
  acercaDe?: string;
  isAdmin?: boolean;
  children?: React.ReactNode;
};

type Vehiculo = {
  id_vehiculo: number;
  marca: string;
  modelo: string;
  anio?: number;
  placa?: string;
  color?: string;
};

const PerfilBase = ({
  id,
  nombre,
  correo,
  apellido_paterno,
  apellido_materno,
  rol,
  imagenPerfil,
  acercaDe,
  isAdmin = false,
}: PerfilBaseProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    apellido_paterno: "",
    apellido_materno: "",
    rol: "cliente",
  });

  const [loading, setLoading] = useState({
    profile: false,
    vehicles: false,
    update: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);

  const brandIcons: Record<string, string> = {
    toyota: "/icons_V/TOYOTA.png",
    honda: "/icons_V/HONDA.png",
    ford: "/icons_V/FORD.png",
    nissan: "/icons_V/NISSAN.png",
    bmw: "/icons_V/BMW.png",
    volkswagen: "/icons_V/VOLKSWAGEN.png",
  };
  const API_URL = import.meta.env.VITE_API_URL;

  // Sincronizar props con el estado
  useEffect(() => {
    setForm({
      nombre: nombre || "",
      correo: correo || "",
      apellido_paterno: apellido_paterno || "",
      apellido_materno: apellido_materno || "",
      rol: rol || "cliente",
    });
  }, [nombre, correo, apellido_paterno, apellido_materno, rol]);

  // Cargar vehículos del cliente
useEffect(() => {
  const fetchVehicles = async () => {
    if (isAdmin) return;

    try {
      setLoading((prev) => ({ ...prev, vehicles: true }));
      const response = await fetch(`${API_URL}/vehicles/user/${id}`);

      if (!response.ok) {
        console.warn("No se encontraron vehículos para el cliente");
        return;
      }

      const data = await response.json();
      const vehicles = data.vehicles || [];

      setVehiculos(vehicles);

      // ✅ Solo mostrar toast si hay vehículos
      if (vehicles.length > 0) {
        toast.success("Vehículos cargados correctamente");
      } else {
        toast.info("No se encontraron vehículos para este usuario");
      }

    } catch (error) {
      console.error("Error al obtener vehículos:", error);
      toast.error("Error al cargar vehículos");
    } finally {
      setLoading((prev) => ({ ...prev, vehicles: false }));
    }
  };

  fetchVehicles();
}, [id, isAdmin]);


  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, update: true }));
    setError(null);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/profile/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar perfil");
      }

      const data = await response.json();
      const updatedUser = data.user;

      if (!updatedUser || !updatedUser.nombre) {
        throw new Error("Respuesta inválida del servidor");
      }
      toast.success("Perfil actualizado correctamente");
      setIsModalOpen(false);

      setForm({
        nombre: updatedUser.nombre || "",
        correo: updatedUser.email || "", // ojo que en backend usas 'email', no 'correo'
        apellido_paterno: updatedUser.apellido_paterno || "",
        apellido_materno: updatedUser.apellido_materno || "",
        rol: updatedUser.rol || "cliente",
      });

      const userParaGuardar = {
        id: updatedUser.id_usuario ?? id, // aquí asignas id para mantener consistencia
        nombre: updatedUser.nombre,
        apellido_paterno: updatedUser.apellido_paterno,
        apellido_materno: updatedUser.apellido_materno,
        correo: updatedUser.email, // aquí también usa 'email' si quieres que coincida con backend
        rol: updatedUser.rol,
      };
      localStorage.setItem("user", JSON.stringify(userParaGuardar));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      toast.error("Hubo un error al actualizar tu perfil");
    } finally {
      setLoading((prev) => ({ ...prev, update: false }));
    }
  };

    const { darkMode } = useTheme();


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 dark:bg-gray-900  ">
<ToastContainer
  position="top-right"
  autoClose={1500}
  theme={darkMode ? 'dark' : 'light'}
  toastClassName="rounded-md shadow-lg"
/>
      <div className={`max-w-4xl mx-auto ${isAdmin ? "max-w-2xl" : ""}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 ">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 dark:text-gray-300">
            <FaUserCircle className="text-blue-600" />
            Mi Perfil
          </h1>
          <button
            onClick={handleModalToggle}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaUserEdit />
            Editar Perfil
          </button>
        </div>

        {/* Tarjeta de perfil */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 dark:bg-gray-800 dark:text-gray-300">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
              <div className="flex-shrink-0">
                {imagenPerfil ? (
                  <img
                    src={imagenPerfil}
                    alt="Perfil"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaUserCircle className="text-blue-500 text-6xl" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-50">
                  {form.nombre} {form.apellido_paterno} {form.apellido_materno}
                </h2>
                <div className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {rol}
                </div>

                <div className="mt-4 flex items-center gap-2 text-gray-600  dark:text-gray-200">
                  <FaEnvelope />
                  <span>{form.correo}</span>
                </div>

                {acercaDe && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <FaInfoCircle />
                      <span>Acerca de mí</span>
                    </div>
                    <p className="mt-1 text-gray-600">{acercaDe}</p>
                  </div>
                )}
              </div>
            </div>

            {!isAdmin && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3 dark:text-gray-200">
                    <FaCar className="text-gray-700 dark:text-gray-300 " />
                    Vehículos registrados
                  </h3>
                  <Link
                    to="/client/addvehicle"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Agregar Vehículo
                  </Link>
                </div>

                {loading.vehicles ? (
                  <div className="flex justify-center py-8">
                    <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                  </div>
                ) : vehiculos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehiculos.map((vehiculo) => {
                      const marcaLower = vehiculo.marca.toLowerCase().trim();
                      const iconSrc = brandIcons[marcaLower];

                      return (
                        
                        <div
                          key={vehiculo.id_vehiculo}
                          className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700 
                          dark:hover:shadow-md "
                        >

                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              {iconSrc ? (
                                <img
                                  src={iconSrc}
                                  alt={vehiculo.marca}
                                  className="w-16 h-16 object-contain"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                                  <FaCarSide className="text-gray-400 text-2xl" />
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <FaCarSide className="text-blue-500" />
                                <span className="font-medium">Marca:</span>
                                <span>{vehiculo.marca}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <FaCogs className="text-indigo-500" />
                                <span className="font-medium">Modelo:</span>
                                <span>{vehiculo.modelo}</span>
                              </div>

                              {vehiculo.anio && (
                                <div className="flex items-center gap-2">
                                  <FaCalendarAlt className="text-green-500" />
                                  <span className="font-medium">Año:</span>
                                  <span>{vehiculo.anio}</span>
                                </div>
                              )}

                              {vehiculo.placa && (
                                <div className="flex items-center gap-2">
                                  <FaHashtag className="text-gray-500" />
                                  <span className="font-medium">Placa:</span>
                                  <span>{vehiculo.placa}</span>
                                </div>
                              )}

                              {vehiculo.color && (
                                <div className="flex items-center gap-2">
                                  <FaPalette className="text-pink-500" />
                                  <span className="font-medium">Color:</span>
                                  <span>{vehiculo.color}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg">
                    No tienes vehículos registrados
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:text-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4 ">
                <h2 className="text-xl font-bold text-gray-800  dark:text-gray-50">
                  Editar Perfil
                </h2>
                <button
                  onClick={handleModalToggle}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 ">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-100 ">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                    dark:border-gray-700 dark:bg-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-100">
                    Correo
                  </label>
                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed dark:text-gray-100 
                     dark:border-gray-700 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200">
                    Apellido Paterno
                  </label>
                  <input
                    type="text"
                    name="apellido_paterno"
                    value={form.apellido_paterno}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    dark:border-gray-700 dark:bg-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-100">
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    name="apellido_materno"
                    value={form.apellido_materno}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700
                    dark:border-gray-700"
                    required
                  />
                </div>

                {error && <div className="text-red-600 text-sm">{error}</div>}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleModalToggle}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading.update}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
                  >
                    {loading.update ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Actualizar Perfil"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfilBase;
