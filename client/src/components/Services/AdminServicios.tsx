import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/Skeleton.css";
import "../../styles/services/ServiciosAdmin.css";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { FaSpinner } from "react-icons/fa";
import { useTheme } from '../../components/common/ThemeContext'; // ajuste según tu estructura

type Service = {
  id_servicio: number;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: string;
  duracion_estimada: number;
  activo: boolean; // <- AGREGAR ESTO
};

const ServiciosAdmin = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState({
    services: true,
    form: false,
    actions: false,
  });

  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [newService, setNewService] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    tipo: "", // antes era "categoria"
    duracion_estimada: 0, // <- Agregado
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  console.log("Datos a enviar:", newService);
  // Debería mostrar: { nombre: "...", tipo: "...", descripcion: "...", precio: ... }

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${API_URL}/Allservice`);

        if (!response.ok) throw new Error("Error al cargar servicios");

        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Response data:", data);
        setServices(data);
        toast.success("Servicios cargados correctamente");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        toast.error("Error al cargar servicios");
      } finally {
        setLoading((prev) => ({ ...prev, services: false }));
      }
    };

    fetchServices();
  }, []);

  const handleRegisterService = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, form: true }));
    console.log("Formulario enviado:", newService);

    try {
      const response = await fetch(`${API_URL}/newService`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newService),
      });

      if (!response.ok) {
        const errorData = await response.json(); // <-- Agregado
        console.error("Error del servidor:", errorData);
        throw new Error(errorData?.error || "Error al registrar servicio"); // <-- Agregado
      }

      const data = await response.json();
      setServices([data, ...services]); // <-- Cambiado de data.service a data

      setNewService({
        nombre: "",
        descripcion: "",
        precio: 0,
        tipo: "",
        duracion_estimada: 0, // <- Agregado
      });

      setShowForm(false);
      toast.success("Servicio registrado exitosamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      toast.error("Error al registrar servicio"); //// esto es tu console log. yo uso otra cosa pero en si seria asi:
      console.log("error al registro"); //// asi ves si si se esta aciendo
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  const updateService = async (id: number, updatedData: Partial<Service>) => {
    setLoading((prev) => ({ ...prev, actions: true }));

    try {
      const response = await fetch(
        `${API_URL}/updateService/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) throw new Error("Error al actualizar servicio");

      const updatedService = await response.json();
      setServices((prev) =>
        prev.map((service) =>
          service.id_servicio === id
            ? { ...service, ...updatedService }
            : service
        )
      );
      toast.success("Servicio actualizado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      toast.error("Error al actualizar servicio");
    } finally {
      setLoading((prev) => ({ ...prev, actions: false }));
    }
  };

  const deleteService = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este servicio?")) return;

    setLoading((prev) => ({ ...prev, actions: true }));

    try {
      const response = await fetch(
        `${API_URL}/deleteService/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Error al eliminar servicio");

      setServices(services.filter((s) => s.id_servicio !== id));
      toast.success("Servicio eliminado exitosamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      toast.error("Error al eliminar servicio");
    } finally {
      setLoading((prev) => ({ ...prev, actions: false }));
    }
  };
        const { darkMode } = useTheme();


  if (loading.services && services.length === 0) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Servicios Registrados</h2>
      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/5">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/5">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duración</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-5 bg-gray-200 rounded w-3/4 dark:bg-gray-700"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2 dark:bg-gray-700"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-full dark:bg-gray-700"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-5 bg-gray-200 rounded w-16 dark:bg-gray-700"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-6 bg-gray-200 rounded-full w-20 dark:bg-gray-700"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-6 bg-gray-200 rounded-full w-20 dark:bg-gray-700"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <div className="h-8 w-8 bg-gray-200 rounded dark:bg-gray-700"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded dark:bg-gray-700"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

  return (
    <div className="p-6 max-w-7xl mx-auto">
<ToastContainer
  position="top-right"
  autoClose={1500}
  theme={darkMode ? 'dark' : 'light'}
  toastClassName="rounded-md shadow-lg"
/>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Gestión de Servicios
          </h1>
          <p className="text-gray-600 mt-1 dark:text-gray-300">
            Administra los servicios ofrecidos a los clientes
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="add-service-button"
          id="new-service"
        >
          {showForm ? "Cancelar" : "Nuevo Servicio"}
        </button>
      </div>

      {showForm && (
        <div className="service-form-container mb-8">
          <form
            onSubmit={handleRegisterService}
            className="space-y-5 dark:bg-gray-800 p-5 rounded"
            id="from-new-service"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 ">
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Lavado económico"
                  value={newService.nombre}
                  onChange={(e) =>
                    setNewService({ ...newService, nombre: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  placeholder="Descripción"
                  value={newService.descripcion}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      descripcion: e.target.value,
                    })
                  }
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Precio</label>
                <input
                  type="number"
                  placeholder="Precio"
                  value={newService.precio}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      precio: parseFloat(e.target.value),
                    })
                  }
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Duración Estimada (minutos)
                </label>
                <input
                  type="number"
                  placeholder="Duración estimada (minutos)"
                  value={newService.duracion_estimada}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      duracion_estimada: parseInt(e.target.value),
                    })
                  }
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Tipo de Servicio</label>
                <select
                  value={newService.tipo}
                  onChange={(e) =>
                    setNewService({ ...newService, tipo: e.target.value })
                  }
                  required
                  className="form-input "
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="lavado">Lavado</option>
                  <option value="estacionamiento">Estacionamiento</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="secondary-button"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading.form}
                className="primary-button"
              >
                {loading.form ? (
                  <span className="flex items-center">
                    <FaSpinner className="mr-2" />
                    Procesando...
                  </span>
                ) : serviceToEdit ? (
                  "Actualizar Servicio"
                ) : (
                  "Registrar Servicio"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          {error}
        </div>
      )}

      {/*modal para la edicion de un servicio */}
      <div className="services-table-container">
        <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100 dark:border-gray-700" id="list-services">
          <table className="services-table">
            <thead className="services-table-header">
              <tr>
                <th className="w-1/5">Nombre</th>
                <th className="w-1/5">Descripción</th>
                <th>Precio</th>
                <th>Duración</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className="services-table-body">
              {services.map((service) => (
                <tr key={service.id_servicio} className="service-row">
                  <td>
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {service.nombre}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                      {service.tipo}
                    </div>
                  </td>
                  <td className="text-sm text-gray-600 max-2">
                    {service.descripcion}
                  </td>
                  <td className="font-medium p-2 text-green-700">
                    ${service.precio}
                  </td>
                  <td className="text-sm">
                    <div className="duration-badge ">
                      {service.duracion_estimada} <span> min</span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge active={service.activo} />
                  </td>
                  <td>
                    <div className="flex space-x-2" id="btn-accion">
                      <button
                        onClick={() => {
                          setServiceToEdit(service);
                          setShowEditModal(true);
                        }}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="action-button delete   bg-red-100 text-yellow-800 rounded hover:bg-red-200"
                        onClick={() => deleteService(service.id_servicio)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edición */}
      {showEditModal && serviceToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md dark:bg-gray-800 ">
            <h3 className="text-lg font-bold mb-4">Editar Servicio</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await updateService(serviceToEdit.id_servicio, serviceToEdit);
                setShowEditModal(false);
              }}
              className="space-y-4"
            >
              <label htmlFor="">
                {" "}
                Nombre
                <input
                  type="text"
                  value={serviceToEdit.nombre}
                  onChange={(e) =>
                    setServiceToEdit({
                      ...serviceToEdit,
                      nombre: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label htmlFor="">
                Descripción
                <textarea
                  value={serviceToEdit.descripcion}
                  onChange={(e) =>
                    setServiceToEdit({
                      ...serviceToEdit,
                      descripcion: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label htmlFor="">
                {" "}
                Precio
                <input
                  type="number"
                  value={serviceToEdit.precio}
                  onChange={(e) =>
                    setServiceToEdit({
                      ...serviceToEdit,
                      precio: parseFloat(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label htmlFor="">
                Duración estimada (por minutos)
                <input
                  type="number"
                  placeholder="Duración estimada (minutos)"
                  value={serviceToEdit.duracion_estimada}
                  onChange={(e) =>
                    setServiceToEdit({
                      ...serviceToEdit,
                      duracion_estimada: parseInt(e.target.value),
                    })
                  }
                  required
                  className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={serviceToEdit.activo}
                  onChange={(e) =>
                    setServiceToEdit({
                      ...serviceToEdit,
                      activo: e.target.checked,
                    })
                  }
                />
                <span>{serviceToEdit.activo ? "Activo" : "Inactivo"}</span>
              </label>

              <select
                value={serviceToEdit.tipo}
                onChange={(e) =>
                  setServiceToEdit({
                    ...serviceToEdit,
                    tipo: e.target.value,
                  })
                }
                className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="lavado">Lavado</option>
                <option value="estacionamiento">Estacionamiento</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded dark:bg-gray-600 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Badge component for service status
const StatusBadge = ({ active }: { active: boolean }) => (
  <span
    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
      active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}
  >
    {active ? "Activo" : "Inactivo"}
  </span>
);

export default ServiciosAdmin;
