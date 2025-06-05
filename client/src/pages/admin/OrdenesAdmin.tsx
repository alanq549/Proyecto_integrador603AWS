import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { toast } from "react-toastify";
import TicketModal from "../../components/common/TicketModal";
import type { Servicio } from "../../types/types";

const OrdenesAdmin = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  // Estados para tipo de cliente
  const [tipoCliente, setTipoCliente] = useState<"registrado" | "noRegistrado">(
    "registrado"
  );
  const [metodoPago, setMetodoPago] = useState("efectivo");

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [color, setColor] = useState("");
  const [idServicios, setIdServicios] = useState<number[]>([]);
  const [notas, setNotas] = useState("");

  // Estados para búsqueda de clientes
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [clientesEncontrados, setClientesEncontrados] = useState<Cliente[]>([]);
  const [vehiculosCliente, setVehiculosCliente] = useState<Vehiculo[]>([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] =
    useState<Vehiculo | null>(null);
  const [mostrarNuevoVehiculo, setMostrarNuevoVehiculo] = useState(false);

  // Definir la interfaz para las órdenes activas
  interface OrdenActiva {
    id_orden: number;
    cliente: string | Cliente;
    vehiculo: string | Vehiculo;
    servicio: string;
    hora_inicio: string; // ISO string
    estado: string;
    estado_pago: string;
    pagos: { estado: string }[];
  }

  ///estado para las ordnes activas y cancelar
  const [ordenesActivas, setOrdenesActivas] = useState<OrdenActiva[]>([]);

  /// para le ticket:
  const [mostrarTicket, setMostrarTicket] = useState(false);
  const [ticketData, setTicketData] = useState<{
    cliente: string;
    vehiculo: string;
    servicios: Servicio[];
    serviciosTexto: string;
    precio: number;
    fecha: string;
    notas: string;
    idOrden?: number;
    duracionTotal?: number;
  }>({
    cliente: "",
    vehiculo: "",
    servicios: [],
    serviciosTexto: "",
    precio: 0,
    fecha: "",
    notas: "",
  });

  // Estados para servicios
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  ///marcar aceptadas
  const marcas = ["Toyota", "Honda", "Ford", "Nissan", "BMW", "Volkswagen"];

  // Interfaces

  interface Cliente {
    id_usuario: number;
    nombre: string;
    email: string;
    vehiculos: Vehiculo[];
  }

  interface Vehiculo {
    id_vehiculo: number;
    placa: string;
    marca: string;
    modelo: string;
    color: string;
  }

  // Cargar servicios al inicio
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const res = await fetch(`${API_URL}/service`);
        const data = await res.json();
        setServicios(data);
        console.log("duracion", data);
      } catch (err) {
        console.error("Error al cargar servicios:", err);
      }
    };

    fetchServicios();
  }, []);

  // Función para buscar clientes
  const buscarClientes = async () => {
    if (!searchQuery.trim()) {
      setError("Por favor ingrese un email para buscar");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/buscar?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();

      if (res.ok) {
        setClientesEncontrados(data.clientes);
        setError("");
      } else {
        setError(data.error || "Error al buscar clientes");
        setClientesEncontrados([]);
      }
    } catch (err) {
      console.error("Error al buscar clientes:", err);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Función para seleccionar cliente
  const seleccionarCliente = (cliente: Cliente) => {
    setSelectedClient(cliente);
    setClientesEncontrados([]);
    setSearchQuery("");
    setError("");

    // Resetear campos de vehículo
    setPlaca("");
    setMarca("");
    setModelo("");
    setColor("");
    setVehiculoSeleccionado(null);

    // Cargar vehículos del cliente
    if (cliente.vehiculos && cliente.vehiculos.length > 0) {
      setVehiculosCliente(cliente.vehiculos);
    } else {
      setVehiculosCliente([]);
    }
  };

  // Función para seleccionar vehículo
  const seleccionarVehiculo = (vehiculo: Vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
    setPlaca(vehiculo.placa);
    setMarca(vehiculo.marca);
    setModelo(vehiculo.modelo);
    setColor(vehiculo.color);
    setMostrarNuevoVehiculo(false);
  };

  const getFechaCDMX_ISO = () => {
    const localStr = new Date().toLocaleString("en-US", {
      timeZone: "America/Mexico_City",
    });
    return new Date(localStr).toISOString();
  };

  // Función para enviar el formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validaciones comunes
      if (idServicios.length === 0) {
        toast.error("Por favor seleccione al menos un servicio");
        throw new Error("Por favor seleccione al menos un servicio");
      }

      if (tipoCliente === "registrado") {
        if (!selectedClient) {
          throw new Error("Por favor seleccione un cliente registrado");
        }

        if (!placa || !marca || !modelo || !color) {
          throw new Error("Por favor complete todos los campos del vehículo");
        }
      } else {
        if (!nombre || !telefono) {
          throw new Error("Por favor complete los datos del cliente");
        }

        if (metodoPago !== "efectivo") {
          throw new Error(
            "Solo se acepta pago en efectivo para clientes ocasionales"
          );
        }
      }

      // Preparar payload según tipo de cliente
      interface Payload {
        placa: string;
        marca: string;
        modelo: string;
        color: string;
        idServicios: number[]; // plural y array
        fechaInicio: string;
        notas: string;
        metodoPago: string;
        idUsuario?: number;
        idVehiculo?: number;
        nombre?: string;
        telefono?: string;
      }

      const payload: Payload = {
        placa,
        marca,
        modelo,
        color,
        idServicios,
        fechaInicio: getFechaCDMX_ISO(),
        notas,
        metodoPago: metodoPago || "efectivo",
      };

      let endpoint = "";

      if (tipoCliente === "registrado") {
        endpoint = `${API_URL}/ordenes/cliente-registrado`;
        payload.idUsuario = selectedClient?.id_usuario;

        if (vehiculoSeleccionado && !mostrarNuevoVehiculo) {
          payload.idVehiculo = vehiculoSeleccionado.id_vehiculo;
        }
      } else {
        endpoint = `${API_URL}/ordenes/cliente-ocasional`;
        payload.nombre = nombre;
        payload.telefono = telefono;
      }

      console.log("Payload a enviar:", JSON.stringify(payload, null, 2));
      console.log("Fecha local CDMX ISO a enviar:", payload.fechaInicio);

      // Enviar la solicitud
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al registrar la orden");
      }

      // Limpiar formulario después de éxito
      resetForm();
      toast.success("Orden registrada con éxito!");

      const serviciosSeleccionados = servicios
        .filter((s) => idServicios.includes(s.id_servicio))
        .map((s) => ({
          ...s,
          duracion: s.duracion_estimada ?? 0, // asegura que siempre sea number
        }));
      const serviciosTexto = serviciosSeleccionados
        .map((s) => s.nombre)
        .join(", ");
      const duracionTotal = serviciosSeleccionados.reduce(
        (acc, s) => acc + (s.duracion_estimada ?? 0),
        0
      );
      const precioTotal = serviciosSeleccionados.reduce(
        (acc, s) => acc + Number(s.precio),
        0
      );

      // Definir nombreCliente y descripcionVehiculo
      const nombreCliente =
        tipoCliente === "registrado" ? selectedClient?.nombre || "" : nombre;

      const descripcionVehiculo =
        placa && marca && modelo && color
          ? `${placa} (${marca} ${modelo}, ${color})`
          : "";

      // Definir fechaActual e idDeOrden
      const fechaActual = new Date().toLocaleString();
      const idDeOrden = data?.idOrden || undefined;

      setTicketData({
        cliente: nombreCliente,
        vehiculo: descripcionVehiculo,
        servicios: serviciosSeleccionados,
        serviciosTexto,
        precio: precioTotal,
        fecha: fechaActual,
        notas,
        idOrden: idDeOrden, // si lo tienes
        duracionTotal,
      });

      setMostrarTicket(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error desconocido");
      }
      console.error("Error al registrar orden:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setNombre("");
    setTelefono("");
    setPlaca("");
    setMarca("");
    setModelo("");
    setColor("");
    setIdServicios([]);
    setNotas("");
    setMetodoPago("efectivo");
    setSelectedClient(null);
    setVehiculoSeleccionado(null);
    setMostrarNuevoVehiculo(false);
    setSearchQuery("");
    setClientesEncontrados([]);
    setError("");
  };

  function handleChange(event: ChangeEvent<HTMLSelectElement>): void {
    const { name, value } = event.target;
    if (name === "marca") {
      setMarca(value);
    }
  }
  /// funcion para cargar ordenes activas:
  const fetchOrdenesActivas = async () => {
    try {
      const res = await fetch(`${API_URL}/ordenes/activas`);
      const json = await res.json();

      console.log("Datos recibidos crudos:", json);

      // Aquí puedes ver toda la data cruda, revisa json.data[x].fecha_inicio

      const ordenesConIdOrden = json.data.map(
        (orden: OrdenActiva & { id: number }) => {
          console.log("Fecha cruda de orden:", orden.hora_inicio); // <-- Aquí ves cada fecha cruda antes del set
          return {
            ...orden,
            id_orden: orden.id,
          };
        }
      );

      setOrdenesActivas(ordenesConIdOrden);
    } catch (error) {
      console.error("Error al cargar órdenes activas:", error);
      toast.error("No se pudieron cargar las órdenes activas");
    }
  };

  const formatHora = (hora: string) => {
    if (!hora) return "--/--/---- --:--";
    const date = new Date(hora);
    if (isNaN(date.getTime())) return "--/--/---- --:--";

    return date.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Mexico_City",
    });
  };

  useEffect(() => {
    fetchOrdenesActivas();
  }, []);

  const confirmarPago = async (idOrden: number) => {
    try {
      await fetch(`${API_URL}/orden/confirmar-pago/${idOrden}`, {
        method: "PUT",
      });
      toast.success("Orden finalizada correctamente");
      await fetchOrdenesActivas(); // en lugar de usar filter
    } catch (error) {
      console.error("Error al confirmar pago:", error);
      toast.error("No se pudo confirmar el pago");
    }
  };

  const cancelarOrden = async (idOrden: number) => {
    try {
      const res = await fetch(`${API_URL}/orden/${idOrden}/cancelar`, {
        method: "PUT",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error desconocido");
      }

      toast.success("Orden cancelada correctamente");
      setOrdenesActivas((prev) => prev.filter((o) => o.id_orden !== idOrden));
    } catch (error) {
      console.error("Error al cancelar orden:", error);
      toast.error(
        error instanceof Error ? error.message : "No se pudo cancelar la orden"
      );
    }
  };

  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();

    // Solo letras, números y guiones
    value = value.replace(/[^A-Z0-9-]/g, "");

    // Evitar guiones dobles consecutivos
    value = value.replace(/-+/g, "-");

    // Dividir en partes por guion
    const parts = value.split("-");

    // Limitar cada parte según la regla: 3 - 2 - 2 caracteres
    parts[0] = parts[0].slice(0, 3);
    if (parts.length > 1) parts[1] = parts[1].slice(0, 2);
    if (parts.length > 2) parts[2] = parts[2].slice(0, 2);

    // Reconstruir la cadena respetando guiones puestos por el usuario
    value = parts.join("-");

    // Limitar longitud total para evitar exceso
    if (value.length > 8) {
      value = value.slice(0, 8);
    }

    setPlaca(value);
  };

  return (
    <div className="admin-content p-6">
      <h1 className="content-title text-2xl font-bold mb-6">
        Gestión Manual de Órdenes
      </h1>

      {/* Formulario de registro */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">Registrar Nueva Orden</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Tipo de cliente */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <svg
                className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Tipo de Cliente
              </h3>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-md transition-colors duration-200 flex items-center ${
                  tipoCliente === "registrado"
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                }`}
                onClick={() => {
                  setTipoCliente("registrado");
                  resetForm();
                }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Cliente Registrado
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-md transition-colors duration-200 flex items-center ${
                  tipoCliente === "noRegistrado"
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                }`}
                onClick={() => {
                  setTipoCliente("noRegistrado");
                  resetForm();
                }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Cliente Ocasional
              </button>
            </div>
          </div>

          {/* Sección de información del cliente */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <svg
                className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {tipoCliente === "registrado"
                  ? "Información del Cliente Registrado"
                  : "Información del Cliente Ocasional"}
              </h3>
            </div>

            {tipoCliente === "registrado" ? (
              <div className="space-y-4">
                {/* Búsqueda de cliente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Buscar Cliente por Email
                  </label>
                  <div className="flex rounded-md shadow-sm">
                    <div className="relative flex-grow focus-within:z-10">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="block w-full pl-10 pr-3 py-2 rounded-l-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={buscarClientes}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Buscando...
                        </>
                      ) : (
                        <>
                          <svg
                            className="-ml-1 mr-2 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          Buscar
                        </>
                      )}
                    </button>
                  </div>

                  {/* Lista de clientes encontrados */}
                  {clientesEncontrados.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-md overflow-hidden dark:border-gray-700">
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto">
                        {clientesEncontrados.map((cliente) => (
                          <li
                            key={cliente.id_usuario}
                            className="p-3 hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-700 transition-colors duration-150"
                            onClick={() => seleccionarCliente(cliente)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {(cliente.nombre ?? "?")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                  {cliente.nombre}
                                </p>
                                <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                  {cliente.email}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  <svg
                                    className="inline w-3 h-3 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                    />
                                  </svg>
                                  {cliente.vehiculos?.length || 0} vehículos
                                  registrados
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Cliente seleccionado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Cliente Seleccionado
                  </label>
                  <div
                    className={`p-3 border rounded-md ${
                      selectedClient
                        ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30"
                        : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700"
                    }`}
                  >
                    {selectedClient ? (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                            {selectedClient.nombre.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedClient.nombre}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedClient.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        Ningún cliente seleccionado
                      </p>
                    )}
                  </div>

                  {/* Selección de vehículo */}
                  {selectedClient && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Vehículo
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setMostrarNuevoVehiculo(!mostrarNuevoVehiculo);
                            if (!mostrarNuevoVehiculo) {
                              setPlaca("");
                              setMarca("");
                              setModelo("");
                              setColor("");
                            }
                          }}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                        >
                          {mostrarNuevoVehiculo ? (
                            <>
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                />
                              </svg>
                              Usar vehículo existente
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                              Agregar nuevo vehículo
                            </>
                          )}
                        </button>
                      </div>

                      {!mostrarNuevoVehiculo && vehiculosCliente.length > 0 ? (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                              />
                            </svg>
                          </div>
                          <select
                            value={vehiculoSeleccionado?.id_vehiculo || ""}
                            onChange={(e) => {
                              const vehiculo = vehiculosCliente.find(
                                (v) =>
                                  v.id_vehiculo === parseInt(e.target.value)
                              );
                              if (vehiculo) seleccionarVehiculo(vehiculo);
                            }}
                            className="mt-1 block w-full pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                          >
                            <option value="">Seleccione un vehículo</option>
                            {vehiculosCliente.map((vehiculo) => (
                              <option
                                key={vehiculo.id_vehiculo}
                                value={vehiculo.id_vehiculo}
                              >
                                {vehiculo.placa} - {vehiculo.marca}{" "}
                                {vehiculo.modelo} ({vehiculo.color})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : !mostrarNuevoVehiculo ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                          Este cliente no tiene vehículos registrados
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Nombre del Cliente
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Nombre completo"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Teléfono
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Número de contacto"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Método de Pago
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="efectivo">Efectivo</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Información del vehículo */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <svg
                className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Información del Vehículo
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Placas
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={placa}
                    onChange={handlePlacaChange}
                    placeholder="ABC-1234"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Marca
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <select
                    name="marca"
                    value={marca}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Selecciona una marca</option>
                    {marcas.map((marca) => (
                      <option key={marca} value={marca.toLowerCase()}>
                        {marca}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Modelo
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    placeholder="Corolla"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Color
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Rojo"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Servicios */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <svg
                className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Servicios
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {servicios.map((servicio) => (
                <div
                  key={servicio.id_servicio}
                  className={`p-3 border rounded-md cursor-pointer transition-colors duration-150 ${
                    idServicios.includes(servicio.id_servicio)
                      ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30"
                      : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 dark:border-gray-700 dark:hover:border-blue-700 dark:hover:bg-blue-900/20"
                  }`}
                  onClick={() => {
                    const id = servicio.id_servicio;
                    if (idServicios.includes(id)) {
                      setIdServicios(idServicios.filter((sid) => sid !== id));
                    } else {
                      setIdServicios([...idServicios, id]);
                    }
                  }}
                >
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={idServicios.includes(servicio.id_servicio)}
                        onChange={() => {}}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        {servicio.nombre}
                      </label>
                      <div className="mt-1 text-gray-500 dark:text-gray-400">
                        <p className="flex items-center">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Precio: ${servicio.precio}
                        </p>
                        {servicio.duracion_estimada && (
                          <p className="flex items-center">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Duración: {servicio.duracion_estimada} min
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <svg
                className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Observaciones
              </h3>
            </div>
            <div className="relative">
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                placeholder="Detalles adicionales, notas especiales..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              ></textarea>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  <svg
                    className="-ml-1 mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Registrar Orden
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Listado de órdenes activas del día */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden dark:bg-gray-800 dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold p-6 pb-4 dark:text-white">
          Órdenes Activas
        </h2>

        <div className="overflow-x-auto">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs md:text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 p-5">
                <tr>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 w-16">
                    ID
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 w-20">
                    Cliente
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 w-32">
                    Vehículo
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 w-40">
                    Servicio
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 w-28">
                    Hora
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 w-24">
                    Estado
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 w-24">
                    Pago
                  </th>
                  <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 w-24">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 p-3 m-2">
                {ordenesActivas.length > 0 ? (
                  ordenesActivas.map((orden) => (
                    <tr
                      key={orden.id_orden}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
                        ORD-{orden.id_orden}
                      </td>
                      <td className="px-2 py-1 text-gray-600 dark:text-gray-300 truncate max-w-[80px]">
                        {typeof orden.cliente === "object"
                          ? orden.cliente?.nombre
                          : orden.cliente || "Ocasional"}
                      </td>
                      <td
                        className="px-2 py-1 text-gray-600 dark:text-gray-300 truncate max-w-[120px]"
                        title={
                          typeof orden.vehiculo === "object"
                            ? `${orden.vehiculo.placa} - ${orden.vehiculo.marca} ${orden.vehiculo.modelo}`
                            : orden.vehiculo || "Indefinido"
                        }
                      >
                        {typeof orden.vehiculo === "object"
                          ? `${orden.vehiculo.placa} (${orden.vehiculo.marca} ${orden.vehiculo.modelo})`
                          : orden.vehiculo || "Indefinido"}
                      </td>
                      <td
                        className="px-2 py-1 text-gray-600 dark:text-gray-300 truncate max-w-[150px]"
                        title={orden.servicio || "-"}
                      >
                        <div className="flex flex-col space-y-1">
                          {orden.servicio
                            ? orden.servicio
                                .split(", ")
                                .map((servicio, index) => (
                                  <div key={index}>{servicio.trim()}</div>
                                ))
                            : "Servicio no disponible"}
                        </div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {formatHora(orden.hora_inicio).split(",")[1].trim()}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${
                            orden.estado === "pendiente"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          }`}
                        >
                          {orden.estado}
                        </span>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${
                            orden.estado_pago === "completado"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          }`}
                        >
                          {orden.estado_pago}
                        </span>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap font-medium">
                        <div className="flex flex-col sm:flex-row sm:space-x-1">
                          {orden.estado_pago !== "completado" && (
                            <button
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 px-1 py-0.5 text-xs"
                              onClick={() => confirmarPago(orden.id_orden)}
                            >
                              Pagar
                            </button>
                          )}
                          {orden.estado === "pendiente" && (
                            <button
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-1 py-0.5 text-xs"
                              onClick={() => cancelarOrden(orden.id_orden)}
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No hay órdenes activas en este momento
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <TicketModal
        visible={mostrarTicket}
        onClose={() => setMostrarTicket(false)}
        datos={ticketData}
      />
    </div>
  );
};

export default OrdenesAdmin;
