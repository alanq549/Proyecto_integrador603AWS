import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Loader from "./components/common/Loader";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ContactoPage from "./pages/client/Contacto";
import ContactoPageClient from "./pages/client/Contacto";
import DashboardCliente from "./pages/client/Dashboard";
import PerfilCliente from "./pages/Perfil/ClientPerfil";
import ClientLayout from "./components/layout/ClientLayout";
import OrderService from "./pages/client/OrderService";
import ServicesHistory from "./pages/client/ServicesHistory";
import DashboardAdmin from "./pages/admin/Dashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ServiciosAdmin from "./components/Services/AdminServicios";
import PerfilAdmin from "./pages/Perfil/AdminPerfil";
import ConfiguracionAdmin from "./components/common/configuracion";
import ConfiguracionClient from "./components/common/configuracion";
import AdminLayout from "./components/layout/AdminLayout";
import OrdenesAdmin from "./pages/admin/OrdenesAdmin";
import Tasks from "./pages/admin/Tasks";
import HistorialOrdenes from "./pages/admin/HistorialOrdenes";
import Reports from "./pages/admin/Reports";
import ProtectedRoute from "./components/ProtectedRoute"; // Asegúrate de importar el componente
import AgregarVehiculo from "./pages/client/AgregarVehiculo";

function AppWrapper() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    const handleStart = (newPath: string) => {
      // Lista de rutas que deben mostrar el loader
      const loaderRoutes = [
        "/login",
        "/register",
        "/contacto",
        "/client",
        "/admin",
      ];

      // Verificar si la nueva ruta está en la lista
      const shouldLoad = loaderRoutes.some(
        (route) => newPath.startsWith(route) && !currentPath.startsWith(route)
      );

      if (shouldLoad) {
        setLoading(true);
      }
    };

    const handleComplete = () => {
      setLoading(false);
      setCurrentPath(location.pathname);
    };

    handleStart(location.pathname);

    // Simulamos un tiempo mínimo de carga (puedes ajustarlo)
    const timer = setTimeout(() => {
      handleComplete();
    }, 800); // 800ms de loader mínimo

    return () => clearTimeout(timer);
  }, [location, currentPath]);

  return (
    <>
      {loading && <Loader />}
      <Routes >
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contacto" element={<ContactoPage />} />

        {/* Rutas del cliente con protección */}
        <Route
          path="/client"
          element={<ProtectedRoute requiredRole="cliente">
              <ClientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardCliente />} />
          <Route path="dashboard" element={<DashboardCliente />} />
          <Route path="perfil" element={<PerfilCliente />} />
          <Route path="order" element={<OrderService />} />
          <Route path="history" element={<ServicesHistory />} />
          <Route path="addvehicle" element={<AgregarVehiculo />} />
          <Route path="config" element={<ConfiguracionClient />} />
          <Route path="contact" element={<ContactoPageClient />} />
        </Route>

        {/* Rutas del admin con protección */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardAdmin />} />
          <Route path="dashboard" element={<DashboardAdmin />} />
          <Route path="Tasks" element={<Tasks />} />
          <Route path="usuarios" element={<ManageUsers />} />
          <Route path="servicios" element={<ServiciosAdmin />} />
          <Route path="perfil" element={<PerfilAdmin />} />
          <Route path="configuracion" element={<ConfiguracionAdmin />} />
          <Route path="HistorialOrdenes" element={<HistorialOrdenes/>} />
          <Route path="informes" element={<Reports />} />
          <Route path="informes" element={<Reports />} />
          <Route path="Order" element={<OrdenesAdmin />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
