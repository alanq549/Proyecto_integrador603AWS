import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useTheme } from "../../components/common/ThemeContext"; // ajuste según tu estructura
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const Reports = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const fetchResumen = async () => {
    const res = await fetch(`${API_URL}/reportes/resumen?range=${timeRange}`);
    if (!res.ok) throw new Error("Error al cargar resumen");
    const data = await res.json();
    console.log("Resumen:", data);
    return data;
  };

  const fetchIngresos = async (range: "week" | "month" | "year") => {
    const res = await fetch(`${API_URL}/reportes/ingresos?range=${range}`);
    const data = await res.json();
    console.log("Ingresos:", data); // Este es el que te interesa
    return data;
  };

  const fetchServicios = async () => {
    const res = await fetch(`${API_URL}/reportes/servicios-distribucion`);

    return res.json();
  };

  const fetchClientesTipo = async () => {
    const res = await fetch(`${API_URL}/reportes/clientes-tipo`);
    return res.json();
  };

  interface UltimaOrden {
    id: number;
    cliente: string;
    servicio: string;
    fecha: string; // O Date, según como venga el backend
    monto: number;
    estado: string;
  }

  const formatDate = (dateString: string) => {
    const formatted = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Mexico_City", // 🔥 México fijo, sin depender del navegador
    };

    return formatted.toLocaleString("es-MX", options);
  };

  const [ultimasOrdenes, setUltimasOrdenes] = useState<UltimaOrden[]>([]);

  const fetchUltimasOrdenes = async () => {
    const res = await fetch(`${API_URL}/reportes/ultimas-ordenes`);
    if (!res.ok) throw new Error("Error al cargar últimas órdenes");
    const json = await res.json();

    console.log("ultmas ordenes", json.data);
    // Asumo que json.data tiene la lista de órdenes con la estructura que definiste en backend
    setUltimasOrdenes(json.data);
  };

  interface Resumen {
    totalOrdenes: number;
    totalIngresos: number;
    clientesNuevos: number;
    servicioPopular: {
      nombre: string;
      porcentaje: number;
    };
  }

  const [resumen, setResumen] = useState<Resumen | null>(null);
  interface RevenueData {
    name: string;
    ingresos: number;
  }
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  interface ServiceData {
    name: string;
    value: number;
  }
  const [serviceData, setServiceData] = useState<ServiceData[]>([]);
  interface ClientTypeData {
    name: string;
    value: number;
  }
  const [clientTypeData, setClientTypeData] = useState<ClientTypeData[]>([]);

  useEffect(() => {
    setLoading(true);

    const loadData = async () => {
      try {
        const [resumenData, ingresosData, serviciosData, clientesData] =
          await Promise.all([
            fetchResumen(),
            fetchIngresos(timeRange),
            fetchServicios(),
            fetchClientesTipo(),
            fetchUltimasOrdenes(),
          ]);

        setResumen(resumenData);
        setRevenueData(ingresosData);
        setServiceData(serviciosData);
        setClientTypeData(clientesData);
        // fetchUltimasOrdenes ya hace setUltimasOrdenes, no necesitas setear aquí
      } catch (error) {
        toast.error("error al cargar los datos de reporte");
        console.error("Error cargando datos de reportes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    toast.success("datos cargados correctamente");
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  useEffect(() => {
    setLoading(true);
    const loadData = async () => {
      try {
        await Promise.all([
          fetchResumen().then(setResumen),
          fetchIngresos(timeRange).then(setRevenueData),
          fetchServicios().then(setServiceData),
          fetchClientesTipo().then(setClientTypeData),
          fetchUltimasOrdenes(),
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [timeRange]);

  const { darkMode } = useTheme();

  return (
    <div className="admin-content p-6" id="Report">
      <div className="flex justify-between items-center mb-6">
        <h1 className="content-title text-2xl font-bold">
          Reportes y Estadísticas
        </h1>
        <ToastContainer
          position="top-right"
          autoClose={1500}
          theme={darkMode ? "dark" : "light"}
          toastClassName="rounded-md shadow-lg"
        />
        <div className="flex space-x-2" id="btn-filter-Report">
          <button
            onClick={() => setTimeRange("week")}
            className={`px-3 py-1 rounded-md ${
              timeRange === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-500 dark:hover:bg-gray-600 dark:text-gray-200"
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-3 py-1 rounded-md ${
              timeRange === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-500 dark:hover:bg-gray-600 dark:text-gray-200"
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setTimeRange("year")}
            className={`px-3 py-1 rounded-md ${
              timeRange === "year"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-500 dark:hover:bg-gray-600 dark:text-gray-200"
            }`}
          >
            Año
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Resumen general - Versión mejorada */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {/* Tarjeta Total Órdenes */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-gray-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-200">
                    Total Órdenes
                  </h3>
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-50 text-center">
                  {resumen?.totalOrdenes ?? "..."}
                </p>
              </div>

              {/* Tarjeta Ingresos */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 rounded-lg bg-green-50 text-green-600 dark:bg-gray-800 ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-200">
                    Ingresos
                  </h3>
                </div>
                <p className="text-3xl font-bold text-green-600 text-center">
                  {resumen?.totalIngresos
                    ? formatCurrency(resumen.totalIngresos)
                    : "..."}
                </p>
              </div>

              {/* Tarjeta Clientes nuevos */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-gray-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-200">
                    Clientes nuevos
                  </h3>
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-50 text-center">
                  {resumen?.clientesNuevos ?? "..."}
                </p>
              </div>

              {/* Tarjeta Servicio más popular */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-200">
                    Servicio más popular
                  </h3>
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-1 dark:text-gray-50">
                  {resumen?.servicioPopular?.nombre ?? "..."}
                </p>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${
                          resumen?.servicioPopular?.porcentaje?.toFixed(1) ?? 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    {resumen?.servicioPopular?.porcentaje?.toFixed(1) ?? 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de ingresos */}
          <div className="bg-white p-4 rounded-lg shadow mb-6 dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Ingresos por{" "}
              {timeRange === "week"
                ? "día"
                : timeRange === "month"
                ? "semana"
                : "mes"}
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis
                    dataKey="name"
                    stroke="#666"
                    tick={{ fill: "#666" }}
                    tickLine={{ stroke: "#666" }}
                  />
                  <YAxis
                    stroke="#666"
                    tick={{ fill: "#666" }}
                    tickLine={{ stroke: "#666" }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Ingresos",
                    ]}
                    contentStyle={{
                      backgroundColor: "#1F2937", // gray-800
                      borderColor: "#4B5563", // gray-600
                      color: "#F9FAFB", // gray-50
                    }}
                    labelStyle={{ color: "#F9FAFB" }}
                    itemStyle={{ color: "#F9FAFB" }}
                  />
                  <Legend wrapperStyle={{ color: "#F9FAFB" }} />
                  <Line
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráficos secundarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distribución de servicios */}
            <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Distribución de Servicios
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {serviceData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [value, "Órdenes"]}
                      contentStyle={{
                        backgroundColor: "#1F2937", // dark:bg-gray-800
                        borderColor: "#4B5563",
                        color: "#F9FAFB", // gray-50
                      }}
                      labelStyle={{ color: "#F9FAFB" }}
                      itemStyle={{ color: "#F9FAFB" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tipo de clientes */}
            <div className="bg-white p-4 rounded-lg shadow dark:bg-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Tipo de Clientes
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={clientTypeData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis
                      type="number"
                      stroke="#D1D5DB" // gray-300
                      tick={{ fill: "#D1D5DB" }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#D1D5DB"
                      tick={{ fill: "#0088DE" }}
                    />
                    <Tooltip
                      formatter={(value) => [value, "Clientes"]}
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        borderColor: "#4B5563",
                        color: "#F9FAFB",
                      }}
                    />
                    <Legend wrapperStyle={{ color: "" }} />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tabla de últimas órdenes */}
          <div className="bg-white p-6 rounded-xl shadow-md mt-6 dark:bg-gray-800 dark:shadow-gray-900/50">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Últimas Órdenes
            </h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {ultimasOrdenes.map((orden) => (
                    <tr
                      key={orden.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        ORD{orden.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {orden.cliente}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col space-y-1">
                          {orden.servicio
                            ? orden.servicio
                                .split(", ")
                                .map((servicio, index) => (
                                  <div key={index}>{servicio.trim()}</div>
                                ))
                            : "Servicio no disponible"}
                        </div>{" "}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(orden.fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {formatCurrency(orden.monto)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            orden.estado.toLowerCase() === "completado"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : orden.estado.toLowerCase() === "pendiente" ||
                                orden.estado.toLowerCase() === "Canceladas"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          }`}
                        >
                          {orden.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
