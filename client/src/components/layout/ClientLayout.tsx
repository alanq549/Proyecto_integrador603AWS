import { BaseLayout } from "./BaseLayout";
import { FaHome, FaCar, FaRegistered } from "react-icons/fa";

const ClientLayout = () => {
  const sidebarItems = [
    { path: "/client/dashboard", label: "Home", icon: <FaHome /> },
    { path: "/client/Order", label: "Order", icon: <FaRegistered /> },
    { path: "/client/history", label: "My Services", icon: <FaCar /> },
  ];
  
  return (
    <>
      <BaseLayout rol="cliente" sidebarItems={sidebarItems} />
    </>
  );
};

export default ClientLayout;