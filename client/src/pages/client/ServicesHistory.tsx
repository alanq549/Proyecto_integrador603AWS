import { useState, useEffect } from "react";
import TicketModal from "../../components/common/TicketModal";

type Servicio = {
  id: number;
  cliente: string;
  vehiculo: string;
  servicio: string;
  hora_inicio: string;
  estado: string;
  alertaProximaFinalizacion: boolean;
};

type ServicioTicket = {
  nombre: string;
  precio: number;
  duracion: number;
};

type TicketData = {
  cliente: string;
  vehiculo: string;
  servicios: ServicioTicket[];
  serviciosTexto: string;
  precio: number;
  fecha: string;
  notas: string;
  idOrden?: number;
  duracionTotal?: number;
};

const ServicesHistory = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [activeTab, setActiveTab] = useState<"activos" | "historicos">(
    "activos"
  );
  const [showTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);

  useEffect(() => {
    const fetchHistorial = async () => {
      const fetchedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = fetchedUser?.id;
      if (!userId) {
        console.error("No se encontró ID de usuario");
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/client/history/${userId}`);
        if (!res.ok) throw new Error("Error al obtener historial");

        const { data } = await res.json();
        console.log("🧾 Ticket data recibido en useffect:", data);

        // Mapeamos los datos del controlador al formato esperado por el componente
        const serviciosAdaptados = data.map(
          (orden: {
            id: number;
            cliente: string;
            vehiculo: string;
            servicio: string;
            hora_inicio: string; // esta es la fecha correcta
            estado: string;
            alertaProximaFinalizacion: boolean;
          }) => ({
            id: orden.id,
            cliente: orden.cliente,
            vehiculo: orden.vehiculo,
            servicio: orden.servicio,
            hora_inicio: orden.hora_inicio,
            estado: orden.estado,
            alertaProximaFinalizacion: orden.alertaProximaFinalizacion,
            fecha: formatDate(orden.hora_inicio), // ✅ Usamos la función correcta
          })
        );

        setServicios(serviciosAdaptados);
      } catch (err) {
        console.error("Error al obtener historial de servicios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [API_URL]);

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "Fecha inválida";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Fecha inválida";

  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Mexico_City",
  }).format(date);
};


  const fetchTicketData = async (idOrden: number) => {
    try {
      // Nota: Necesitarás implementar este endpoint en tu backend
      const res = await fetch(`${API_URL}/client/ticket/${idOrden}`);
      if (!res.ok) throw new Error("Error al obtener ticket");
      const data = await res.json();
      console.log("🧾 Ticket data recibido:", data);


      setTicketData({
        idOrden: data.idOrden,
        cliente: data.cliente,
        vehiculo: data.vehiculo,
        servicios: data.servicios,
        serviciosTexto: data.servicios
          .map((s: ServicioTicket) => s.nombre)
          .join(", "),
        precio: data.precio,
        fecha: formatDate(data.fecha),
        notas: data.notas,
        duracionTotal: data.servicios.reduce(
          (acc: number, s: ServicioTicket) => acc + s.duracion,
          0
        ),
      });

      setShowTicket(true);
    } catch (error) {
      console.error("Error cargando ticket:", error);
      alert("No se pudo cargar el ticket. Intenta de nuevo.");
    }
  };

  const filteredServices = servicios.filter((servicio) =>
    activeTab === "activos"
      ? servicio.estado.toLowerCase().includes("pendiente") ||
        servicio.estado.toLowerCase().includes("en_proceso") // Ajustado según estados posibles
      : servicio.estado.toLowerCase().includes("completado") ||
        servicio.estado.toLowerCase().includes("cancelado")
  );

  const getStatusColor = (estado: string) => {
    const lowerEstado = estado.toLowerCase();
    if (lowerEstado.includes("completado"))
      return "bg-green-100 text-green-800";
    else if (lowerEstado.includes("cancelado"))
      return "bg-red-100 text-red-800";
    else if (
      lowerEstado.includes("pendiente") ||
      lowerEstado.includes("en_proceso")
    )
      return "bg-yellow-100 text-yellow-800";
    else return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
        Mis Servicios
      </h1>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === "activos"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("activos")}
        >
          Activos
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === "historicos"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("historicos")}
        >
          Histórico
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="animate-pulse">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-2 w-3/4">
                    <div className="h-5 bg-gray-200 rounded dark:bg-gray-700"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-20 dark:bg-gray-700"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-24 dark:bg-gray-700"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServices.length > 0 ? (
            filteredServices.map((servicio) => (
              <div
                key={servicio.id}
                className={`p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 ${
                  servicio.alertaProximaFinalizacion
                    ? "border-2 border-yellow-500 animate-pulse"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-200">
                      {servicio.servicio}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {servicio.cliente} - {servicio.vehiculo}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Hora de inicio: {formatDate(servicio.hora_inicio)}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      servicio.estado
                    )}`}
                  >
                    {servicio.estado.replace("_", " ")}
                  </span>
                </div>
                <button
                  onClick={() => fetchTicketData(servicio.id)}
                  className="mt-3 text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  Ver ticket
                </button>
                {servicio.alertaProximaFinalizacion && (
                  <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                    ⚠️ El servicio está por finalizar
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                No hay servicios{" "}
                {activeTab === "activos" ? "activos" : "en tu historial"}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {activeTab === "activos"
                  ? "No tienes servicios activos en este momento."
                  : "Tu historial de servicios aparecerá aquí."}
              </p>
            </div>
          )}
        </div>
      )}

      {ticketData && (
        <TicketModal
          visible={showTicket}
          onClose={() => setShowTicket(false)}
          datos={ticketData}
        />
      )}
    </div>
  );
};

export default ServicesHistory;
