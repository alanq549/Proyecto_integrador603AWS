import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaUserShield, FaUser, FaQuestionCircle } from "react-icons/fa"; // Admin y Cliente
import type { ReactNode } from "react";
import { startManualTour } from "../TourGuide"; // Asegúrate de que la ruta es correcta


import "./Sidebar.css";

type SidebarItem = {
  path: string;
  label: string;
  icon?: ReactNode; // Hacerlo opcional para compatibilidad
};

type SidebarProps = {
  items: SidebarItem[];
  rol: "admin" | "cliente";
};

type User = {
  id_usuario: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  rol: string;
};

const Sidebar = ({ items, rol }: SidebarProps) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser.id;

  const panelTitle = rol === "admin" ? "PANEL DE ADMINISTRACIÓN" : "MI CUENTA";

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        console.error("ID de usuario no encontrado en localStorage");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/profile/${userId}`);
        if (!res.ok) throw new Error("No se pudo obtener el usuario");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error al obtener el perfil:", err);
      }
    };

    fetchUser();
  }, [userId]);


    const handleShowTour = () => {
    const mappedRol = rol === "cliente" ? "client" : rol;
    startManualTour(mappedRol, location.pathname);
    setShowUserMenu(false);
  };


  return (
    <>
      {/* Botón Hamburguesa */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md shadow-lg"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <aside
        className={`sidebar ${
          sidebarOpen ? "open" : ""
        } flex flex-col h-screen`}
      >
        <div className="sidebar-content">
          <h2 className="sidebar-title">{panelTitle}</h2>
          <nav className="sidebar-nav">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${
                  location.pathname.startsWith(item.path) ? "active" : ""
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                {/* Mostrar icono si existe */}
                {item.icon && <span className="mr-4 ">{item.icon}</span>}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Esta parte se mantiene igual, el mt-auto hará su magia */}
        <div className="user-section">
          <div
            className="user-profile flex items-center p-3 cursor-pointer hover:bg-gray-700 rounded"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            {rol === "admin" ? (
              <FaUserShield className="text-white mr-4" />
            ) : (
              <FaUser className="text-white mr-4" />
            )}
            {user ? (
              <span className="text-white">
                {user.nombre && user.apellido_materno
                  ? `${user.nombre} ${user.apellido_materno}`
                  : "Completa tu perfil"}
              </span>
            ) : (
              <span className="text-white">Cargando...</span>
            )}
          </div>

          {/* aqui es donde va a estar lo de la api, ya lo demas funciona como debe pero el detalle es que cmo es uno compartido aqui nesesito ver que use se logeo y obtener sus datos*/}
          {/* Menú de Usuario (modal) */}
          {showUserMenu && (
            <div className="absolute bottom-16 left-4 bg-gray-600 dark:bg-gray-800 rounded-lg shadow-xl py-1 w-56 z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Botón para mostrar el tour */}
              <button
                onClick={handleShowTour}
                className="flex items-center w-full px-4 py-3 text-gray-200 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <FaQuestionCircle className="w-5 h-5 mr-3 text-gray-200 dark:text-gray-400" />
                Mostrar Tour
              </button>

              {rol === "admin" ? (
                <>
                  <Link
                    to="/admin/perfil"
                    className="flex items-center px-4 py-3 text-gray-200 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-gray-200 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    My Profile
                  </Link>
                  <Link
                    to="/admin/configuracion"
                    className="flex items-center px-4 py-3 text-gray-200 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-gray-200 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <Link
                    to="/"
                    className="flex items-center px-4 py-3 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/20 transition-colors"
                    onClick={() => {
                      localStorage.removeItem("user");
                      localStorage.removeItem("token");
                      setShowUserMenu(false);
                    }}
                  >
                    <svg
                      className="w-5 h-5 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Log out
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/client/perfil"
                    className="flex items-center px-4 py-3 text-gray-200 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-gray-200 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Mi Perfil
                  </Link>
                  <Link
                    to="/client/contact"
                    className="flex items-center px-4 py-3  text-gray-200 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-gray-200 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Contacto
                  </Link>
                  <Link
                    to="/client/config"
                    className="flex items-center px-4 py-3 text-gray-200 dark:text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-gray-200 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Configuración
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <Link
                    to="/"
                    className="flex items-center px-4 py-3 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/20 transition-colors"
                    onClick={() => {
                      localStorage.removeItem("user");
                      localStorage.removeItem("token");
                      setShowUserMenu(false);
                    }}
                  >
                    <svg
                      className="w-5 h-5 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Cerrar sesión
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Overlay para móviles */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => {
            setSidebarOpen(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
