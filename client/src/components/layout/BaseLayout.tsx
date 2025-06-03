// src/components/layout/BaseLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "../common/sidebar/Sidebar";

type BaseLayoutProps = {
  rol: 'admin' | 'cliente';
  sidebarItems: { path: string; label: string; icon: React.ReactNode }[];
};

export const BaseLayout = ({ rol, sidebarItems }: BaseLayoutProps) => {
  return (
<div className="flex h-screen bg-gray-100 dark:bg-gray-900">
    <Sidebar items={sidebarItems} rol={rol} />
<main className="flex-1 overflow-y-auto p-6 text-gray-900 dark:text-gray-100">
      <Outlet /> {/* Contenido dinámico */}
    </main>
  </div>
  );
};