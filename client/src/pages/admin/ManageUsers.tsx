// src/pages/admin/ManageUsers.tsx
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/Skeleton.css";
import "../../styles/admin/ManageUsers.css";
import { useTheme } from '../../components/common/ThemeContext'; // ajuste según tu estructura


type User = {
  id_usuario: number;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  rol: "cliente" | "admin";
  fecha_creacion: string;
};

const ManageUsers = () => {
      const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState({
    users: true,
    form: false,
    actions: false,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
  });

  // Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/users`);

        if (!response.ok) {
          throw new Error("Error al cargar usuarios");
        }

        const data = await response.json();
        setUsers(data);
        toast.success("Usuarios cargados correctamente");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        toast.error("Error al cargar usuarios");
      } finally {
        setLoading((prev) => ({ ...prev, users: false }));
      }
    };

    fetchUsers();
  }, []);

  // Registrar nuevo admin
  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, form: true }));
    console.log("Formulario enviado:", newUser); // Agregar aquí

    try {
      const response = await fetch(`${API_URL}/registerA`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error("Error al registrar administrador");
      }

      const data = await response.json();
      console.log("🟢 Usuario creado:", data);

      setUsers([data.user, ...users]);
      setNewUser({
        email: "",
        password: "",
        nombre: "",
        apellido_paterno: "",
        apellido_materno: "",
      });
      setShowForm(false);
      toast.success("Administrador registrado exitosamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      toast.error("Error al registrar administrador");
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  // Eliminar usuario
  const deleteUser = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

    setLoading((prev) => ({ ...prev, actions: true }));

    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar usuario");
      }

      setUsers(users.filter((user) => user.id_usuario !== id));
      toast.success("Usuario eliminado exitosamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      toast.error(
        err instanceof Error ? err.message : "Error al eliminar usuario"
      );
    } finally {
      setLoading((prev) => ({ ...prev, actions: false }));
    }
  };
        const { darkMode } = useTheme();


  // Renderizado de skeleton loading
if (loading.users && users.length === 0) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Usuarios Registrados</h2>
      <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800 dark:shadow-gray-900/50">
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-600">
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-5 bg-gray-200 rounded w-40 dark:bg-gray-700"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-5 bg-gray-200 rounded w-56 dark:bg-gray-700"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-6 bg-gray-200 rounded-full w-24 dark:bg-gray-700"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-8 bg-gray-200 rounded-md w-20 dark:bg-gray-700"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
  return (
    <div className="p-6">
<ToastContainer
  position="top-right"
  autoClose={1500}
  theme={darkMode ? 'dark' : 'light'}
  toastClassName="rounded-md shadow-lg"
/>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {showForm ? "Cancelar" : "Nuevo Administrador"}
        </button>
      </div>

        {/*modal para agregar un nuevo user */}
      {showForm && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h3 className="text-xl font-semibold mb-4">
            Registrar Nuevo Administrador
          </h3>
          <form onSubmit={handleRegisterAdmin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email*</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-700
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading.form}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Contraseña*
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-700
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading.form}
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre*
                </label>
                <input
                  type="text"
                  value={newUser.nombre}
                  onChange={(e) =>
                    setNewUser({ ...newUser, nombre: e.target.value })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-700
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading.form}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Apellido Paterno
                </label>
                <input
                  type="text"
                  value={newUser.apellido_paterno}
                  onChange={(e) =>
                    setNewUser({ ...newUser, apellido_paterno: e.target.value })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-700
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading.form}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Apellido Materno
                </label>
                <input
                  type="text"
                  value={newUser.apellido_materno}
                  onChange={(e) =>
                    setNewUser({ ...newUser, apellido_materno: e.target.value })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-700
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading.form}
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
              disabled={loading.form}
            >
              {loading.form ? "Registrando..." : "Registrar Administrador"}
            </button>
          </form>
        </div>
      )}

      {error ? (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800 dark:shadow-gray-900/50">
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-600">
                {users.map((user) => (
                  <tr
                    key={user.id_usuario}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.nombre} {user.apellido_paterno}{" "}
                          {user.apellido_materno}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${
                  user.rol === "admin"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                }`}
                      >
                        {user.rol === "admin" ? "Administrador" : "Cliente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      
                      <button
                        onClick={() => deleteUser(user.id_usuario)}
                        className="px-3 py-1.5 bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50
                          dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                        disabled={loading.actions}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
