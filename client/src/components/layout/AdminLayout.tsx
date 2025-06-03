import { BaseLayout } from "./BaseLayout";
import AlertaOrdenes from "../common/AlertaOrdenes"; // Ajusta la ruta si es necesario

import {
  FaTachometerAlt,
  FaUsers,
  FaListAlt,
  FaInfo,
  FaRegistered,
  FaTasks,
  FaHistory,
} from "react-icons/fa";

const AdminLayout = () => {
  const sidebarItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/admin/Tasks", label: "Tasks", icon: <FaTasks /> },
    { path: "/admin/servicios", label: "Services", icon: <FaListAlt /> },
    { path: "/admin/Order", label: "Orders", icon: <FaRegistered /> },
    { path: "/admin/HistorialOrdenes", label: "Order history", icon: <FaHistory /> },
    { path: "/admin/usuarios", label: "Users", icon: <FaUsers /> },
    { path: "/admin/Informes", label: "Reports", icon: <FaInfo /> },
  ];

  return <>
<BaseLayout rol="admin" sidebarItems={sidebarItems} />
        <AlertaOrdenes />

  </>
  
};

export default AdminLayout;
