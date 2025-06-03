import { useState, useEffect } from "react";
import "../../styles/admin/Tasks.css";
import { useTheme } from '../../components/common/ThemeContext'; // ajuste según tu estructura


// Componentes de UI mejorados
import { ThreeDots } from "react-loader-spinner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// url base del backend 


type Task = {
  id_tarea: number;
  titulo: string;
  descripcion: string;
  fecha_limite: string;
  prioridad: "baja" | "media" | "alta";
  estado: "pendiente" | "en_progreso" | "completado";
};

const Tasks = () => {
      const API_URL = import.meta.env.VITE_API_URL;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState({
    tasks: true,
    add: false,
    update: false,
    delete: false,
  });
  const [error, setError] = useState<string | null>(null);

  const [newTask, setNewTask] = useState({
    titulo: "",
    descripcion: "",
    fecha_limite: "",
    prioridad: "media" as "baja" | "media" | "alta",
    id_asignado: undefined as number | undefined,
  });

  const [adminId, setAdminId] = useState<number | null>(null);

  // Cargar tareas al montar el componente
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const id = userData?.id;
    if (id) {
      setAdminId(id);
    }

    const fetchTasks = async () => {
      try {
        setLoading((prev) => ({ ...prev, tasks: true }));
        const response = await fetch(`${API_URL}/tasks`);

        if (!response.ok) {
          throw new Error("Error al cargar tareas");
        }

        const data = await response.json();
        setTasks(data);
        toast.success("Tareas cargadas correctamente");
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMsg);
        toast.error(`Error: ${errorMsg}`);
      } finally {
        setLoading((prev) => ({ ...prev, tasks: false }));
      }
    };

    fetchTasks();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminId) {
      toast.error("No se pudo obtener el ID del administrador");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, add: true }));

      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newTask,
          id_asignado: adminId, // 👈 lo inyectás acá
          estado: "pendiente",
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear tarea");
      }

      const createdTask = await response.json();
      setTasks([...tasks, createdTask]);

      setNewTask({
        titulo: "",
        descripcion: "",
        fecha_limite: "",
        prioridad: "media",
        id_asignado: undefined, // ya no lo necesitás
      });

      toast.success("Tarea creada exitosamente");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al crear tarea";
      setError(errorMsg);
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setLoading((prev) => ({ ...prev, add: false }));
    }
  };

  const updateTaskStatus = async (id: number, newStatus: Task["estado"]) => {
    try {
      setLoading((prev) => ({ ...prev, update: true }));

      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar tarea");
      }

      const updatedTask = await response.json();
      setTasks(
        tasks.map((task) => (task.id_tarea === id ? updatedTask : task))
      );

      toast.success("Estado de tarea actualizado");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al actualizar tarea";
      setError(errorMsg);
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setLoading((prev) => ({ ...prev, update: false }));
    }
  };

  const confirmDelete = (id: number, title: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la tarea "${title}"?`)) {
      deleteTask(id);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      setLoading((prev) => ({ ...prev, delete: true }));

      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar tarea");
      }

      setTasks(tasks.filter((task) => task.id_tarea !== id));
      toast.success("Tarea eliminada correctamente");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al eliminar tarea";
      setError(errorMsg);
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };
        const { darkMode } = useTheme();
  

  if (loading.tasks && tasks.length === 0) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Skeleton del formulario */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
        <div className="space-y-4">
          <div>
            <div className="h-5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div>
            <div className="h-5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="h-5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div>
              <div className="h-5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-10 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-4"></div>
        </div>
      </div>

      {/* Skeleton de la lista de tareas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="h-8 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-700 rounded mb-3"></div>
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

return (
  <div className="p-6 max-w-6xl mx-auto">
<ToastContainer
  position="top-right"
  autoClose={1500}
  theme={darkMode ? 'dark' : 'light'}
  toastClassName="rounded-md shadow-lg"
/>

    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Tareas</h1>
    <p className="text-gray-600 dark:text-gray-300 mb-6">Gestión de actividades y recordatorios</p>

    {error && (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
        <p>{error}</p>
      </div>
    )}

    <div className="space-y-8">
      {/* Formulario para nueva tarea */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Agregar Nueva Tarea</h2>
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
            <input
              type="text"
              value={newTask.titulo}
              onChange={(e) => setNewTask({ ...newTask, titulo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              disabled={loading.add}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
            <textarea
              value={newTask.descripcion}
              onChange={(e) => setNewTask({ ...newTask, descripcion: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
              disabled={loading.add}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha límite</label>
              <input
                type="date"
                value={newTask.fecha_limite}
                onChange={(e) => setNewTask({ ...newTask, fecha_limite: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                disabled={loading.add}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
              <select
                value={newTask.prioridad}
                onChange={(e) => setNewTask({ ...newTask, prioridad: e.target.value as "baja" | "media" | "alta" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={loading.add}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading.add ? 'opacity-70 cursor-not-allowed' : ''
            } dark:bg-blue-700 dark:hover:bg-blue-800`}
            disabled={loading.add}
          >
            {loading.add ? (
              <div className="flex items-center justify-center">
                <ThreeDots
                  height="20"
                  width="20"
                  radius="3"
                  color="#ffffff"
                  ariaLabel="three-dots-loading"
                  visible={true}
                />
              </div>
            ) : (
              "Agregar Tarea"
            )}
          </button>
        </form>
      </div>

      {/* Listado de tareas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2 mb-6">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg dark:bg-blue-700">Todas</button>
        </div>

        <div className="space-y-4">
          {tasks.length === 0 && !loading.tasks ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No hay tareas registradas</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id_tarea}
                className={`border rounded-lg p-4 transition-all ${
                  task.prioridad === 'alta' 
                    ? 'border-red-200 dark:border-red-800' 
                    : task.prioridad === 'media' 
                    ? 'border-yellow-200 dark:border-yellow-800' 
                    : 'border-blue-200 dark:border-blue-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      task.prioridad === 'alta' 
                        ? 'bg-red-500' 
                        : task.prioridad === 'media' 
                        ? 'bg-yellow-500' 
                        : 'bg-blue-500'
                    }`}></span>
                    <h3 className="font-medium text-gray-800 dark:text-white">{task.titulo}</h3>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    task.estado === 'pendiente'
                      ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      : task.estado === 'en_progreso'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {task.estado === "pendiente" ? "Pendiente" : task.estado === "en_progreso" ? "En progreso" : "Completada"}
                  </span>
                </div>
                <div className="mb-3">
                  <p className="text-gray-600 dark:text-gray-300 mb-2">{task.descripcion}</p>
                  <p className="text-sm">
                    Prioridad:{" "}
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      task.prioridad === "alta"
                        ? "text-red-800 bg-red-100 dark:text-red-300 dark:bg-red-900/30"
                        : task.prioridad === "media"
                        ? "text-yellow-800 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30"
                        : "text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30"
                    }`}>
                      {task.prioridad}
                    </span>
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    📅 {new Date(task.fecha_limite).toLocaleDateString()}
                  </span>

                  <div className="flex space-x-2">
                    {task.estado !== "completado" && (
                      <>
                        {task.estado === "pendiente" && (
                          <button
                            onClick={() => updateTaskStatus(task.id_tarea, "en_progreso")}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-70 dark:bg-blue-700 dark:hover:bg-blue-800"
                            disabled={loading.update}
                          >
                            {loading.update ? "Procesando..." : "Iniciar"}
                          </button>
                        )}
                        {task.estado === "en_progreso" && (
                          <button
                            onClick={() => updateTaskStatus(task.id_tarea, "completado")}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-70 dark:bg-green-700 dark:hover:bg-green-800"
                            disabled={loading.update}
                          >
                            {loading.update ? "Procesando..." : "Completar"}
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => confirmDelete(task.id_tarea, task.titulo)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-70 dark:bg-red-700 dark:hover:bg-red-800"
                      disabled={loading.delete}
                    >
                      {loading.delete ? "Eliminando" : "Eliminar"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
);
};

export default Tasks;
