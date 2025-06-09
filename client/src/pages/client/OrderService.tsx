import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import TicketModal from "../../components/common/TicketModal";
import { useTheme } from "../../components/common/ThemeContext"; // ajuste según tu estructura

import {
  FaCar,
  FaCarSide,
  FaCogs,
  FaHashtag,
  FaPalette,
  FaInfoCircle,
  FaTimes,
  FaSpinner,
  FaMoneyBillWave,
  FaClock,
  FaTag,
  FaCalendarAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
type Servicio = {
  id_servicio: number;
  nombre: string;
  precio: number;
  duracion_estimada: number;
  tipo: string;
  descripcion?: string;
};

type Vehiculo = {
  id_vehiculo: number;
  marca: string;
  modelo: string;
  placa: string;
  color: string;
};

type UserProfile = {
  nombre?: string;
  apellido_materno?: string;
  apellido_paterno?: string;
  telefono?: string;
};

const OrderService = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [loading, setLoading] = useState({
    servicios: false,
    vehiculos: false,
    reserva: false,
    perfil: false,
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [selectedService, setSelectedService] = useState<Servicio | null>(null);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [notas, setNotas] = useState("");
  const [fechaReserva, setFechaReserva] = useState(new Date());

  // Mapeo de iconos de marcas
  const brandIcons: Record<string, string> = {
    toyota: "/icons_V/TOYOTA.png",
    honda: "/icons_V/HONDA.png",
    ford: "/icons_V/FORD.png",
    nissan: "/icons_V/NISSAN.png",
    bmw: "/icons_V/BMW.png",
    volkswagen: "/icons_V/VOLKSWAGEN.png",
  };

  // Para el ticket
  const [ticketVisible, setTicketVisible] = useState(false);
  type TicketData = {
    idOrden: number;
    cliente: string;
    vehiculo: string;
    servicios: Array<{
      nombre: string;
      precio: number;
      duracion: number | null;
    }>;
    serviciosTexto: string;
    duracionTotal: number;
    precio: number;
    fecha: string;
    estado: string;
    notas: string;
  };

  const [ticketData, setTicketData] = useState<TicketData | null>(null);

  // Obtener usuario del localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;

  const isProfileComplete = Boolean(
    userProfile?.nombre?.trim() &&
      userProfile?.apellido_materno?.trim() &&
      userProfile?.apellido_paterno?.trim()
  );

  // Cargar datos del cliente
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        setLoading((prev) => ({ ...prev, perfil: true }));
        const res = await fetch(`${API_URL}/profile/${userId}`);
        const data = await res.json();
        if (data) {
          setUserProfile(data);
        }
      } catch {
        toast.error("Error al cargar perfil de usuario");
      } finally {
        setLoading((prev) => ({ ...prev, perfil: false }));
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Cargar servicios disponibles
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading((prev) => ({ ...prev, servicios: true }));
        const res = await fetch(`${API_URL}/service`);
        const data = await res.json();
        setServicios(data);
      } catch {
        toast.error("Error al cargar servicios");
      } finally {
        setLoading((prev) => ({ ...prev, servicios: false }));
      }
    };

    fetchServices();
  }, []);

  // Cargar vehículos del cliente
  useEffect(() => {
    if (!userId) return;

    const fetchVehicles = async () => {
      try {
        setLoading((prev) => ({ ...prev, vehiculos: true }));
        const res = await fetch(`${API_URL}/vehicles/user/${userId}`);
        const data = await res.json();
        setVehiculos(data.vehicles || []);
      } catch {
        toast.error("Error al cargar vehículos");
      } finally {
        setLoading((prev) => ({ ...prev, vehiculos: false }));
      }
    };

    fetchVehicles();
  }, [userId]);

function getCDMXISOString(date: Date): string {
  const tzOffset = -date.getTimezoneOffset(); // en minutos
  const sign = tzOffset >= 0 ? "+" : "-";
  const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, "0");

  const offsetHours = pad(tzOffset / 60);
  const offsetMinutes = pad(tzOffset % 60);

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return `${year}-${month}-${day}T${hour}:${minute}:${second}${sign}${offsetHours}:${offsetMinutes}`;
}


  console.log("Payload enviado:", {
  idUsuario: userId,
  idVehiculo: selectedVehicle,
  idServicios: selectedServices,
  fechaInicio: getCDMXISOString(fechaReserva),
  notas: notas || "Sin observaciones",
});

  const handleReservation = async () => {
    if (!selectedVehicle) {
      toast.error("Por favor selecciona un vehículo");
      return;
    }
    if (!userId) {
      toast.error("No se pudo identificar al usuario");
      return;
    }
    if (!isProfileComplete) {
      toast.error("Completa tu perfil antes de reservar un servicio");
      return;
    }
    if (selectedServices.length === 0) {
      toast.error("Por favor selecciona al menos un servicio");
      return;
    }

    const now = new Date();
    const diffMs = fechaReserva.getTime() - now.getTime();
    const hour = fechaReserva.getHours();

    // ⛔ Evitar reservas con menos de 5 minutos
    if (diffMs < 5 * 60 * 1000) {
      toast.error("Debes reservar con al menos 5 minutos de anticipación.");
      return;
    }

    // ⛔ Verificar rango de horario permitido
    if (hour < 8 || hour >= 20) {
      toast.error("Solo puedes reservar entre las 08:00 y 20:00 hrs.");
      return;
    }

    

    setLoading((prev) => ({ ...prev, reserva: true }));

    try {
      const res = await fetch(`${API_URL}/client/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          idUsuario: userId,
          idVehiculo: selectedVehicle,
          idServicios: selectedServices,
          fechaInicio: getCDMXISOString(fechaReserva),
          notas: notas || "Sin observaciones",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al reservar");

      const vehiculo = vehiculos.find((v) => v.id_vehiculo === selectedVehicle);
      const serviciosSeleccionados = servicios.filter((s) =>
        selectedServices.includes(s.id_servicio)
      );

      const serviciosDetalle = serviciosSeleccionados.map((s) => ({
        nombre: s.nombre,
        precio: s.precio,
        duracion: s.duracion_estimada,
      }));

      const duracionTotal = serviciosDetalle.reduce(
        (acc, s) => acc + (s.duracion || 0),
        0
      );

      setTicketData({
        idOrden: data.orden?.id_orden,
        cliente: `${userProfile.nombre} ${userProfile.apellido_paterno} ${userProfile.apellido_materno}`,
        vehiculo: `${vehiculo?.marca} ${vehiculo?.modelo} (${vehiculo?.placa})`,
        servicios: serviciosDetalle,
        serviciosTexto: serviciosDetalle
          .map((s) => `${s.nombre} - ${s.duracion ?? "?"}min`)
          .join(", "),
        duracionTotal,
        precio: serviciosDetalle.reduce(
          (total, s) => total + Number(s.precio),
          0
        ),
        fecha: formatFecha(fechaReserva),
        estado: "pendiente",
        notas: notas || "Ninguna",
      });

      setTicketVisible(true);
      toast.dismiss(); // opcional, limpia anteriores
      toast.success(
        `¡Gracias por tu reserva! 🚗 Tu ${vehiculo?.marca} ${vehiculo?.modelo} ha sido agendado con éxito. Pronto nos veremos.`
      );

      // Resetear selección después de reservar
      setSelectedServices([]);
      setNotas("");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Error desconocido al reservar");
      }
    } finally {
      setLoading((prev) => ({ ...prev, reserva: false }));
    }
  };

  const formatFecha = (dateInput: string | Date) => {
    if (!dateInput) return "--/--/---- --:--";

    try {
      const fecha =
        typeof dateInput === "string" ? new Date(dateInput) : dateInput;

      if (isNaN(fecha.getTime())) {
        console.warn("Fecha inválida:", dateInput);
        return "--/--/---- --:--";
      }

      return fecha.toLocaleString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/Mexico_City", // 🧠 Aquí está la magia
      });
    } catch (error) {
      console.error(
        "Error formateando fecha/hora:",
        error,
        "Valor recibido:",
        dateInput
      );
      return "--/--/---- --:--";
    }
  };

  const toggleServiceSelection = (idServicio: number) => {
    try {
      setSelectedServices((prev) =>
        prev.includes(idServicio)
          ? prev.filter((id) => id !== idServicio)
          : [...prev, idServicio]
      );
    } catch (error) {
      console.error("Error al modificar selección:", error);
      // Puedes resetear el estado si es necesario
      setSelectedServices([]);
    }
  };

  const openServiceDetails = (service: Servicio) => {
    setSelectedService(service);
  };

  const closeServiceDetails = () => {
    setSelectedService(null);
  };

  const formatLocalDatetime = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");

    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());

    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
  };

  const getMinFechaReserva = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return formatLocalDatetime(now);
  };

  const totalPrice = servicios
    .filter((s) => selectedServices.includes(s.id_servicio))
    .reduce((total, s) => total + Number(s.precio), 0);

  // Simple translation function for button labels
  function t(key: string): string {
    const translations: Record<string, string> = {
      select_service: "Seleccionar servicio",
      modify_selection: "Modificar selección",
      total_label: "Total",
    };
    return translations[key] || key;
  }

  const { darkMode } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        theme={darkMode ? "dark" : "light"}
        toastClassName="rounded-md shadow-lg"
      />
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
            <FaTag className="text-blue-600" />
            Reservar Servicio
          </h1>
          {!isProfileComplete && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md flex items-center">
              <FaInfoCircle className="mr-2" />
              <p className="pr-2">Completa tu perfil en la sección</p>{" "}
              <Link
                to="/client/perfil"
                className="underline font-medium hover:text-red-900"
              >
                Mi perfil
              </Link>{" "}
              <p className="pl-2">para reservar</p>
            </div>
          )}
        </div>

        {/* Panel principal */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800 dark:border dark:border-gray-700">
          <div className="p-6">
            {/* Selección de vehículo */}
            <div className="mb-8" id="vehcule-selection">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-200 flex items-center gap-2">
                <FaCar className="text-blue-500" />
                Tu vehículo
              </h2>

              {loading.vehiculos ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(2)].map((_, index) => (
                    <div
                      key={index}
                      className="border rounded-xl p-4 cursor-pointer transition-all duration-200 border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex gap-3 items-center">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg dark:bg-gray-700 animate-pulse"></div>
                        </div>
                        <div className="space-y-2 w-full">
                          <div className="h-5 w-3/4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse"></div>
                          <div className="h-4 w-1/2 bg-gray-200 rounded dark:bg-gray-700 animate-pulse"></div>
                          <div className="h-4 w-1/2 bg-gray-200 rounded dark:bg-gray-700 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : vehiculos.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehiculos.map((vehiculo) => {
                      const marcaLower = vehiculo.marca.toLowerCase().trim();
                      const iconSrc = brandIcons[marcaLower];

                      return (
                        <div
                          key={vehiculo.id_vehiculo}
                          onClick={() =>
                            setSelectedVehicle(vehiculo.id_vehiculo)
                          }
                          className={`border rounded-xl p-4 cursor-pointer transition-all duration-200
                            ${
                              selectedVehicle === vehiculo.id_vehiculo
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 hover:border-blue-300 dark:border-gray-600"
                            }
                          `}
                        >
                          <div className="flex gap-3 items-center">
                            <div className="flex-shrink-0">
                              {iconSrc ? (
                                <img
                                  src={iconSrc}
                                  alt={vehiculo.marca}
                                  className="w-12 h-12 object-contain"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg dark:bg-gray-700">
                                  <FaCarSide className="text-gray-400 text-xl" />
                                </div>
                              )}
                            </div>

                            <div>
                              <h3 className="font-medium text-gray-800 dark:text-gray-200">
                                {vehiculo.marca} {vehiculo.modelo}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <FaHashtag className="text-gray-400" />
                                <span>{vehiculo.placa}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <FaPalette className="text-gray-400" />
                                <span>{vehiculo.color}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : userId ? (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200">
                  No tienes vehículos registrados. Registra uno para poder
                  reservar servicios.
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200">
                  Inicia sesión para ver tus vehículos registrados
                </div>
              )}
            </div>

            {/* Selección de fecha y hora */}
            <div className="mb-8" id="hors-selection">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-200 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" />
                Fecha y hora de reserva horarios de atencion 8 am - 8pm
              </h2>
              <div className="max-w-md">
                <input
                  type="datetime-local"
                  value={formatLocalDatetime(fechaReserva)}
                  onChange={(e) => {
                    const selected = new Date(e.target.value);
                    const hour = selected.getHours();

                    if (hour < 8 || hour >= 20) {
                      toast.error(
                        "El horario permitido es de 08:00 a 20:00 hrs"
                      );
                      return;
                    }

                    const ahora = new Date();
                    const diffMs = selected.getTime() - ahora.getTime();

                    if (diffMs < 5 * 60 * 1000) {
                      toast.error(
                        "Debes reservar al menos con 5 minutos de anticipación"
                      );
                      return;
                    }

                    setFechaReserva(selected);
                  }}
                  min={getMinFechaReserva()}
                  className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Listado de servicios */}
            <div id="service-selection">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 dark:text-gray-200 flex items-center gap-2">
                <FaCogs className="text-indigo-500" />
                Servicios disponibles
                {selectedServices.length > 0 && (
                  <span className="ml-2 text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                    {selectedServices.length} seleccionados
                  </span>
                )}
              </h2>

              {loading.servicios ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(2)].map((_, index) => (
                    <div
                      key={index}
                      className="border rounded-xl overflow-hidden transition-all duration-300 dark:border-gray-700"
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start">
                          <div className="h-6 w-3/4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse"></div>
                          <div className="h-5 w-16 bg-gray-200 rounded-full dark:bg-gray-700 animate-pulse"></div>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="h-4 w-full bg-gray-200 rounded dark:bg-gray-700 animate-pulse"></div>
                          <div className="h-4 w-5/6 bg-gray-200 rounded dark:bg-gray-700 animate-pulse"></div>
                          <div className="h-4 w-4/6 bg-gray-200 rounded dark:bg-gray-700 animate-pulse"></div>
                        </div>

                        <div className="mt-5 space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-200 rounded-full dark:bg-gray-700 animate-pulse"></div>
                            <div className="h-4 w-1/3 bg-gray-200 rounded dark:bg-gray-700 animate-pulse"></div>
                            <div className="h-4 w-1/4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse ml-auto"></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-200 rounded-full dark:bg-gray-700 animate-pulse"></div>
                            <div className="h-4 w-1/3 bg-gray-200 rounded dark:bg-gray-700 animate-pulse"></div>
                            <div className="h-4 w-1/4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse ml-auto"></div>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 pb-5 space-y-3">
                        <div className="h-4 w-1/2 bg-gray-200 rounded mx-auto dark:bg-gray-700 animate-pulse"></div>
                        <div className="h-10 w-full bg-gray-200 rounded-lg dark:bg-gray-700 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {servicios.map((service) => (
                    <div
                      key={service.id_servicio}
                      className={`border rounded-xl overflow-hidden transition-all duration-300
                        dark:border-gray-700 ${
                          selectedServices.includes(service.id_servicio)
                            ? "ring-2 ring-blue-500 shadow-lg"
                            : "hover:shadow-lg dark:hover:shadow-gray-900/50"
                        }`}
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            {service.nombre}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              service.tipo === "lavado"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                : service.tipo === "pulido"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            }`}
                          >
                            {service.tipo}
                          </span>
                        </div>

                        <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm">
                          {service.descripcion ||
                            "Servicio de calidad profesional"}
                        </p>

                        <div className="mt-5 space-y-2">
                          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                            <FaMoneyBillWave className="text-green-500" />
                            <span className="font-medium">Precio:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              ${service.precio}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                            <FaClock className="text-blue-500" />
                            <span className="font-medium">Duración:</span>
                            <span>{service.duracion_estimada} min</span>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 pb-5 space-y-3">
                        <button
                          onClick={() => openServiceDetails(service)}
                          className="w-full py-2 text-sm font-medium text-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Ver detalles completos
                        </button>

                        <button
                          onClick={() => {
                            try {
                              toggleServiceSelection(service.id_servicio);
                              closeServiceDetails();
                            } catch (error) {
                              console.error("Error en botón:", error);
                            }
                          }}
                          className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                            selectedServices?.includes(service.id_servicio)
                              ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300"
                              : "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
                          }`}
                        >
                          {selectedServices?.includes(service.id_servicio)
                            ? t("modify_selection") || "Modificar selección"
                            : t("select_service") || "Seleccionar servicio"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resumen y observaciones */}
            {selectedServices.length > 0 && (
              <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-all duration-300">
                <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Resumen de tu reserva
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Servicios seleccionados */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-200 dark:border-gray-600 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Servicios seleccionados
                    </h4>

                    <ul className="space-y-3">
                      {servicios
                        .filter((s) => selectedServices.includes(s.id_servicio))
                        .map((service) => (
                          <li
                            key={service.id_servicio}
                            className="flex justify-between items-center py-2"
                          >
                            <span className="text-gray-700 dark:text-gray-300">
                              {service.nombre}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              ${service.precio.toLocaleString()}
                            </span>
                          </li>
                        ))}
                    </ul>

                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {t("total_label")}:
                      </span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {new Intl.NumberFormat("es-MX", {
                          style: "currency",
                          currency: "MXN",
                          minimumFractionDigits: 2,
                        }).format(totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div>
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300 flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Observaciones (opcional)
                      </label>
                      <textarea
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        rows={4}
                        placeholder="Ej: Necesito lavado interior, preferencias especiales..."
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all"
                      />
                    </div>

                    {/* Detalles adicionales */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Detalles de tu reserva
                      </h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li className="flex items-center gap-2">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Fecha: {fechaReserva.toLocaleString()}{" "}
                          {/* 🧠 Muestra fecha + hora local */}
                        </li>

                        <li className="flex items-center gap-2">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Hora:{" "}
                          {fechaReserva.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </li>
                        {selectedVehicle && (
                          <li className="flex items-center gap-2">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Vehículo:{" "}
                            {(() => {
                              const vehiculoObj = vehiculos.find(
                                (v) => v.id_vehiculo === selectedVehicle
                              );
                              return vehiculoObj
                                ? `${vehiculoObj.marca} ${vehiculoObj.modelo}`
                                : "";
                            })()}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* ⚠️ Advertencia de pago en efectivo */}
                <div className=" m-5 mb-4 p-4 border-l-4 border-yellow-400 bg-yellow-100 dark:bg-yellow-900 dark:text-gray-100 rounded-md shadow-sm ">
                  <p className="text-sm md:text-base font-medium">
                    ⚠️ Por favor, realiza el pago en efectivo entre{" "}
                    <strong>5 y 10 minutos antes</strong> de tu hora de reserva,
                    de lo contrario la misma{" "}
                    <strong>será cancelada automáticamente</strong>.
                  </p>
                </div>

                {/* Botón de confirmación */}
                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                  <button
                    onClick={handleReservation}
                    disabled={
                      !selectedVehicle ||
                      loading.reserva ||
                      !userId ||
                      !isProfileComplete ||
                      fechaReserva.getHours() < 8 ||
                      fechaReserva.getHours() >= 20 ||
                      fechaReserva.getTime() - new Date().getTime() <
                        5 * 60 * 1000
                    }
                    className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all flex items-center gap-3 ${
                      !selectedVehicle || !userId || !isProfileComplete
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                        : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl dark:from-blue-700 dark:to-blue-600 dark:hover:from-blue-800 dark:hover:to-blue-700"
                    }`}
                  >
                    {loading.reserva ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Procesando reserva...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Confirmar reserva</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalles del servicio */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {selectedService.nombre}
                </h2>
                <button
                  onClick={closeServiceDetails}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="mt-6 space-y-5">
                <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Detalles del servicio
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                      <FaTag className="text-blue-500" />
                      <div>
                        <span className="font-medium">Tipo:</span>
                        <span className="ml-2 capitalize">
                          {selectedService.tipo}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                      <FaMoneyBillWave className="text-green-500" />
                      <div>
                        <span className="font-medium">Precio:</span>
                        <span className="ml-2 text-green-600 font-bold dark:text-green-400">
                          ${selectedService.precio}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                      <FaClock className="text-blue-500" />
                      <div>
                        <span className="font-medium">Duración estimada:</span>
                        <span className="ml-2">
                          {selectedService.duracion_estimada} minutos
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Descripción
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedService.descripcion ||
                      "Este servicio no tiene una descripción detallada."}
                  </p>
                </div>

                <button
                  onClick={() => {
                    toggleServiceSelection(selectedService.id_servicio);
                    closeServiceDetails();
                  }}
                  className={`w-full py-3 px-6 rounded-lg font-medium text-lg transition-colors flex items-center justify-center gap-2 ${
                    selectedServices.includes(selectedService.id_servicio)
                      ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300"
                      : "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
                  }`}
                >
                  {selectedServices.includes(selectedService.id_servicio)
                    ? "Modificar selección"
                    : "Seleccionar este servicio"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal del ticket */}
      {ticketData && (
        <TicketModal
          visible={ticketVisible}
          onClose={() => setTicketVisible(false)}
          datos={ticketData}
        />
      )}
    </div>
  );
};

export default OrderService;
