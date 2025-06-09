import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useLocation } from "react-router-dom";

interface TourConfig {
  [key: string]: {
    steps: Array<{
      element: string;
      popover: {
        title: string;
        description: string;
        side?: "left" | "right" | "top" | "bottom";
        align?: "start" | "center" | "end";
      };
    }>;
  };
}

interface TourGuideProps {
  userType: "admin" | "client";
}

const TourGuide = ({ userType }: TourGuideProps) => {
  const location = useLocation();

  // Configuración de los tours para cada tipo de usuario y ruta
  const tourConfig: TourConfig = {
    "/admin/dashboard": {
      steps: [
        {
          element: "#dashboard-stats",
          popover: {
            title: "Métricas de Rendimiento",
            description: "Monitorea los KPIs clave de tu negocio en tiempo real para una toma de decisiones informada.",
          },
        },
        {
          element: "#recent-orders",
          popover: {
            title: "Reservas Recientes",
            description: "Revisa las últimas solicitudes de servicio con detalles completos de cada transacción.",
          },
        },
        {
          element: "#clients",
          popover: {
            title: "Gestión de Clientes",
            description: "Accede al registro completo de clientes con opciones de filtrado y análisis.",
          },
        },
        {
          element: "#services",
          popover: {
            title: "Catálogo de Servicios",
            description: "Administra todos los servicios disponibles y sus configuraciones.",
          },
        },
        {
          element: "#pending-tasks",
          popover: {
            title: "Tareas Pendientes",
            description: "Revisa y prioriza las acciones requeridas para mantener la operación fluida.",
          },
        },
      ],
    },
    "/admin/Tasks": {
      steps: [
        {
          element: "#add-task",
          popover: {
            title: "Creación de Tareas",
            description: "Registra nuevas actividades asignando responsables y plazos de ejecución.",
          },
        },
        {
          element: "#add-tasks-btn",
          popover: {
            title: "Confirmar Registro",
            description: "Guarda la tarea en el sistema y notifica al equipo responsable.",
          },
        },
        {
          element: "#tasks-list",
          popover: {
            title: "Listado de Tareas",
            description: "Visualiza el estado de todas las actividades con opciones de filtrado por prioridad o estado.",
          },
        },
      ],
    },
    "/admin/servicios": {
      steps: [
        {
          element: "#new-service",
          popover: {
            title: "Nuevo Servicio",
            description: "Expande tu oferta agregando nuevos servicios al catálogo.",
          },
        },
        {
          element: "#from-new-service",
          popover: {
            title: "Formulario de Servicio",
            description: "Completa todos los campos requeridos para registrar un nuevo servicio.",
          },
        },
        {
          element: "#list-services",
          popover: {
            title: "Administración de Servicios",
            description: "Edita, desactiva o elimina servicios según las necesidades del negocio.",
          },
        },
        {
          element: "#btn-accion",
          popover: {
            title: "Acciones Rápidas",
            description: "Realiza modificaciones a los servicios con un solo clic.",
          },
        },
      ],
    },
    "/admin/Order": {
      steps: [
        {
          element: "#from-Orden",
          popover: {
            title: "Proceso de Reserva",
            description: "Sistema completo para gestionar reservas de clientes registrados y ocasionales.",
          },
        },
        {
          element: "#type-client",
          popover: {
            title: "Tipo de Cliente",
            description: "Selecciona si la reserva es para un cliente existente o nuevo.",
          },
        },
        {
          element: "#client-register-form",
          popover: {
            title: "Búsqueda de Clientes",
            description: "Localiza clientes registrados mediante nombre, email o documento de identidad.",
          },
        },
        {
          element: "#client-register-form-btn",
          popover: {
            title: "Confirmar Búsqueda",
            description: "Ejecuta la consulta en la base de datos de clientes.",
          },
        },
        {
          element: "#client-register",
          popover: {
            title: "Selección de Cliente",
            description: "Elige el cliente de los resultados de búsqueda para asociar la reserva.",
          },
        },
        {
          element: "#view-service",
          popover: {
            title: "Disponibilidad",
            description: "Consulta los servicios activos y sus horarios disponibles.",
          },
        },
        {
          element: "#select-service",
          popover: {
            title: "Selección de Servicio",
            description: "Elige el servicio requerido por el cliente.",
          },
        },
        {
          element: "#confir-btn",
          popover: {
            title: "Finalizar Reserva",
            description: "Completa el proceso de reservación y genera el comprobante.",
          },
        },
        {
          element: "#cancel-btn",
          popover: {
            title: "Cancelar Operación",
            description: "Aborta el proceso actual sin guardar cambios.",
          },
        },
        {
          element: "#list-active",
          popover: {
            title: "Reservas Activas",
            description: "Administra las reservas en curso y actualiza sus estados.",
          },
        },
      ],
    },
    "/admin/HistorialOrdenes": {
      steps: [
        {
          element: "#history",
          popover: {
            title: "Historial de Reservas",
            description: "Accede al registro completo de todas las transacciones realizadas.",
          },
        },
        {
          element: "#btn-filter",
          popover: {
            title: "Filtros Avanzados",
            description: "Organiza la información por fechas, estados o tipos de servicio.",
          },
        },
      ],
    },
    "/admin/usuarios": {
      steps: [
        {
          element: "#users",
          popover: {
            title: "Administración de Usuarios",
            description: "Gestiona los perfiles de acceso al sistema con diferentes niveles de permiso.",
          },
        },
        {
          element: "#btn-addAdmin",
          popover: {
            title: "Agregar Administrador",
            description: "Crea nuevas cuentas con privilegios administrativos.",
          },
        },
        {
          element: "#btn-deleteUser",
          popover: {
            title: "Eliminar Usuario",
            description: "Remueve cuentas del sistema manteniendo la integridad de los datos.",
          },
        },
      ],
    },
    "/admin/Informes": {
      steps: [
        {
          element: "#Report",
          popover: {
            title: "Reportes Analíticos",
            description: "Genera informes detallados sobre el rendimiento del negocio.",
          },
        },
        {
          element: "#btn-filter-Report",
          popover: {
            title: "Personalizar Reportes",
            description: "Selecciona períodos específicos y métricas a incluir en el análisis.",
          },
        },
      ],
    },
    "/admin/perfil": {
      steps: [
        {
          element: "#AdminPerfil",
          popover: {
            title: "Perfil Administrativo",
            description: "Visualiza y gestiona la información de tu cuenta administrativa.",
          },
        },
        {
          element: "#btn-edit-infoA",
          popover: {
            title: "Editar Información",
            description: "Modifica los datos de tu perfil personal.",
          },
        },
        {
          element: "#form-edit",
          popover: {
            title: "Formulario de Edición",
            description: "Actualiza tu información personal y profesional.",
          },
        },
        {
          element: "#Emailt",
          popover: {
            title: "Gestión de Email",
            description: "Para cambiar tu correo electrónico, visita la sección de Configuración de Cuenta.",
          },
        },
        {
          element: "#btn-save",
          popover: {
            title: "Guardar Cambios",
            description: "Confirma y almacena las modificaciones realizadas.",
          },
        },
      ],
    },
    "/aadmin/config": {
      steps: [
        {
          element: "#btn-dark",
          popover: {
            title: "Modo de Visualización",
            description: "Alterna entre tema claro y oscuro según tus preferencias.",
          },
        },
        {
          element: "#btn-changes-password",
          popover: {
            title: "Seguridad de Cuenta",
            description: "Actualiza tu contraseña siguiendo el protocolo de verificación.",
          },
        },
        {
          element: "#btn-changes-email",
          popover: {
            title: "Cambio de Email",
            description: "Modifica tu correo electrónico principal con verificación en dos pasos.",
          },
        },
      ],
    },
    "/client/dashboard": {
      steps: [
        {
          element: "#service-cards",
          popover: {
            title: "Panel de Control",
            description: "Accede rápidamente a todas las funcionalidades disponibles para clientes.",
          },
        },
        {
          element: "#section-help",
          popover: {
            title: "Soporte al Cliente",
            description: "Contacta a nuestro equipo de soporte para asistencia inmediata.",
          },
        },
      ],
    },
    "/client/Order": {
      steps: [
        {
          element: "#vehcule-selection",
          popover: {
            title: "Selección de Vehículo",
            description: "Elige el automóvil que recibirá el servicio de tu elección.",
          },
        },
        {
          element: "#hors-selection",
          popover: {
            title: "Programación de Cita",
            description: "Selecciona fecha y hora para tu servicio (horario disponible: 8am - 8pm).",
          },
        },
        {
          element: "#service-selection",
          popover: {
            title: "Catálogo de Servicios",
            description: "Explora y selecciona entre nuestra variedad de servicios disponibles.",
          },
        },
      ],
    },
    "/client/history": {
      steps: [
        {
          element: "#history-selection",
          popover: {
            title: "Historial de Servicios",
            description: "Revisa el registro completo de todos los servicios recibidos.",
          },
        },
        {
          element: "#actives-selection",
          popover: {
            title: "Servicios Activos",
            description: "Consulta el estado de tus servicios programados o en progreso.",
          },
        },
      ],
    },
    "/client/perfil": {
      steps: [
        {
          element: "#perfilClient",
          popover: {
            title: "Mi Perfil",
            description: "Revisa y actualiza tu información personal y preferencias.",
          },
        },
        {
          element: "#btn-edit-infoC",
          popover: {
            title: "Editar Perfil",
            description: "Modifica tus datos personales cuando sea necesario.",
          },
        },
        {
          element: "#form-editc",
          popover: {
            title: "Formulario de Actualización",
            description: "Actualiza tu información personal para mantenerla al día.",
          },
        },
        {
          element: "#Emailt",
          popover: {
            title: "Configuración de Email",
            description: "Para cambiar tu correo, visita la sección de Configuración de Cuenta.",
          },
        },
        {
          element: "#btn-save",
          popover: {
            title: "Guardar Información",
            description: "Confirma los cambios realizados en tu perfil.",
          },
        },
        {
          element: "#btn-cancel",
          popover: {
            title: "Descartar Cambios",
            description: "Cancela las modificaciones sin guardar.",
          },
        },
        {
          element: "#section-vehicles",
          popover: {
            title: "Mis Vehículos",
            description: "Administra el registro de tus vehículos asociados a la cuenta.",
          },
        },
        {
          element: "#btn-addVehicle",
          popover: {
            title: "Agregar Vehículo",
            description: "Registra un nuevo vehículo para agilizar futuras reservas.",
          },
        },
      ],
    },
    "/client/config": {
      steps: [
        {
          element: "#btn-dark",
          popover: {
            title: "Preferencias Visuales",
            description: "Personaliza la apariencia de la plataforma según tu gusto.",
          },
        },
        {
          element: "#btn-changes-password",
          popover: {
            title: "Seguridad de Cuenta",
            description: "Actualiza tu contraseña periódicamente para mayor protección.",
          },
        },
        {
          element: "#btn-changes-email",
          popover: {
            title: "Actualización de Email",
            description: "Cambia tu dirección de correo electrónico principal.",
          },
        },
      ],
    },
  };

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(
      `hasSeenTour_${userType}_${location.pathname}`
    );
    const currentTourConfig = tourConfig[location.pathname];

    if (!hasSeenTour && currentTourConfig) {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        steps: currentTourConfig.steps,
        onCloseClick: () => {
          driverObj.destroy();
          localStorage.setItem(
            `hasSeenTour_${userType}_${location.pathname}`,
            "true"
          );
        },
        onDestroyed: () => {
          localStorage.setItem(
            `hasSeenTour_${userType}_${location.pathname}`,
            "true"
          );
        },
      });

      // Pequeño retraso para asegurar que los elementos estén renderizados
      setTimeout(() => {
        driverObj.drive();
      }, 500);
    }
  }, [location.pathname, userType]);

  return null;
};

export const startManualTour = (
  userType: "admin" | "client",
  pathname: string
) => {

    const isAdminRoute = pathname.startsWith("/admin");
  const isClientRoute = pathname.startsWith("/client");

  if ((userType === "admin" && !isAdminRoute) ||
      (userType === "client" && !isClientRoute)) {
    return; // Evita mostrar el tour si el tipo de usuario no coincide con la ruta
  }

  // Configuración de los tours para cada tipo de usuario y ruta
  const tourConfig: TourConfig = {
    "/admin/dashboard": {
      steps: [
        {
          element: "#dashboard-stats",
          popover: {
            title: "Métricas de Rendimiento",
            description: "Monitorea los KPIs clave de tu negocio en tiempo real para una toma de decisiones informada.",
          },
        },
        {
          element: "#recent-orders",
          popover: {
            title: "Reservas Recientes",
            description: "Revisa las últimas solicitudes de servicio con detalles completos de cada transacción.",
          },
        },
        {
          element: "#clients",
          popover: {
            title: "Gestión de Clientes",
            description: "Accede al registro completo de clientes con opciones de filtrado y análisis.",
          },
        },
        {
          element: "#services",
          popover: {
            title: "Catálogo de Servicios",
            description: "Administra todos los servicios disponibles y sus configuraciones.",
          },
        },
        {
          element: "#pending-tasks",
          popover: {
            title: "Tareas Pendientes",
            description: "Revisa y prioriza las acciones requeridas para mantener la operación fluida.",
          },
        },
      ],
    },
    "/admin/Tasks": {
      steps: [
        {
          element: "#add-task",
          popover: {
            title: "Creación de Tareas",
            description: "Registra nuevas actividades asignando responsables y plazos de ejecución.",
          },
        },
        {
          element: "#add-tasks-btn",
          popover: {
            title: "Confirmar Registro",
            description: "Guarda la tarea en el sistema y notifica al equipo responsable.",
          },
        },
        {
          element: "#tasks-list",
          popover: {
            title: "Listado de Tareas",
            description: "Visualiza el estado de todas las actividades con opciones de filtrado por prioridad o estado.",
          },
        },
      ],
    },
    "/admin/servicios": {
      steps: [
        {
          element: "#new-service",
          popover: {
            title: "Nuevo Servicio",
            description: "Expande tu oferta agregando nuevos servicios al catálogo.",
          },
        },
        {
          element: "#from-new-service",
          popover: {
            title: "Formulario de Servicio",
            description: "Completa todos los campos requeridos para registrar un nuevo servicio.",
          },
        },
        {
          element: "#list-services",
          popover: {
            title: "Administración de Servicios",
            description: "Edita, desactiva o elimina servicios según las necesidades del negocio.",
          },
        },
        {
          element: "#btn-accion",
          popover: {
            title: "Acciones Rápidas",
            description: "Realiza modificaciones a los servicios con un solo clic.",
          },
        },
      ],
    },
    "/admin/Order": {
      steps: [
        {
          element: "#from-Orden",
          popover: {
            title: "Proceso de Reserva",
            description: "Sistema completo para gestionar reservas de clientes registrados y ocasionales.",
          },
        },
        {
          element: "#type-client",
          popover: {
            title: "Tipo de Cliente",
            description: "Selecciona si la reserva es para un cliente existente o nuevo.",
          },
        },
        {
          element: "#client-register-form",
          popover: {
            title: "Búsqueda de Clientes",
            description: "Localiza clientes registrados mediante nombre, email o documento de identidad.",
          },
        },
        {
          element: "#client-register-form-btn",
          popover: {
            title: "Confirmar Búsqueda",
            description: "Ejecuta la consulta en la base de datos de clientes.",
          },
        },
        {
          element: "#client-register",
          popover: {
            title: "Selección de Cliente",
            description: "Elige el cliente de los resultados de búsqueda para asociar la reserva.",
          },
        },
        {
          element: "#view-service",
          popover: {
            title: "Disponibilidad",
            description: "Consulta los servicios activos y sus horarios disponibles.",
          },
        },
        {
          element: "#select-service",
          popover: {
            title: "Selección de Servicio",
            description: "Elige el servicio requerido por el cliente.",
          },
        },
        {
          element: "#confir-btn",
          popover: {
            title: "Finalizar Reserva",
            description: "Completa el proceso de reservación y genera el comprobante.",
          },
        },
        {
          element: "#cancel-btn",
          popover: {
            title: "Cancelar Operación",
            description: "Aborta el proceso actual sin guardar cambios.",
          },
        },
        {
          element: "#list-active",
          popover: {
            title: "Reservas Activas",
            description: "Administra las reservas en curso y actualiza sus estados.",
          },
        },
      ],
    },
    "/admin/HistorialOrdenes": {
      steps: [
        {
          element: "#history",
          popover: {
            title: "Historial de Reservas",
            description: "Accede al registro completo de todas las transacciones realizadas.",
          },
        },
        {
          element: "#btn-filter",
          popover: {
            title: "Filtros Avanzados",
            description: "Organiza la información por fechas, estados o tipos de servicio.",
          },
        },
      ],
    },
    "/admin/usuarios": {
      steps: [
        {
          element: "#users",
          popover: {
            title: "Administración de Usuarios",
            description: "Gestiona los perfiles de acceso al sistema con diferentes niveles de permiso.",
          },
        },
        {
          element: "#btn-addAdmin",
          popover: {
            title: "Agregar Administrador",
            description: "Crea nuevas cuentas con privilegios administrativos.",
          },
        },
        {
          element: "#btn-deleteUser",
          popover: {
            title: "Eliminar Usuario",
            description: "Remueve cuentas del sistema manteniendo la integridad de los datos.",
          },
        },
      ],
    },
    "/admin/Informes": {
      steps: [
        {
          element: "#Report",
          popover: {
            title: "Reportes Analíticos",
            description: "Genera informes detallados sobre el rendimiento del negocio.",
          },
        },
        {
          element: "#btn-filter-Report",
          popover: {
            title: "Personalizar Reportes",
            description: "Selecciona períodos específicos y métricas a incluir en el análisis.",
          },
        },
      ],
    },
    "/admin/perfil": {
      steps: [
        {
          element: "#AdminPerfil",
          popover: {
            title: "Perfil Administrativo",
            description: "Visualiza y gestiona la información de tu cuenta administrativa.",
          },
        },
        {
          element: "#btn-edit-infoA",
          popover: {
            title: "Editar Información",
            description: "Modifica los datos de tu perfil personal.",
          },
        },
        {
          element: "#form-edit",
          popover: {
            title: "Formulario de Edición",
            description: "Actualiza tu información personal y profesional.",
          },
        },
        {
          element: "#Emailt",
          popover: {
            title: "Gestión de Email",
            description: "Para cambiar tu correo electrónico, visita la sección de Configuración de Cuenta.",
          },
        },
        {
          element: "#btn-save",
          popover: {
            title: "Guardar Cambios",
            description: "Confirma y almacena las modificaciones realizadas.",
          },
        },
      ],
    },
    "/aadmin/config": {
      steps: [
        {
          element: "#btn-dark",
          popover: {
            title: "Modo de Visualización",
            description: "Alterna entre tema claro y oscuro según tus preferencias.",
          },
        },
        {
          element: "#btn-changes-password",
          popover: {
            title: "Seguridad de Cuenta",
            description: "Actualiza tu contraseña siguiendo el protocolo de verificación.",
          },
        },
        {
          element: "#btn-changes-email",
          popover: {
            title: "Cambio de Email",
            description: "Modifica tu correo electrónico principal con verificación en dos pasos.",
          },
        },
      ],
    },
    "/client/dashboard": {
      steps: [
        {
          element: "#service-cards",
          popover: {
            title: "Panel de Control",
            description: "Accede rápidamente a todas las funcionalidades disponibles para clientes.",
          },
        },
        {
          element: "#section-help",
          popover: {
            title: "Soporte al Cliente",
            description: "Contacta a nuestro equipo de soporte para asistencia inmediata.",
          },
        },
      ],
    },
    "/client/Order": {
      steps: [
        {
          element: "#vehcule-selection",
          popover: {
            title: "Selección de Vehículo",
            description: "Elige el automóvil que recibirá el servicio de tu elección.",
          },
        },
        {
          element: "#hors-selection",
          popover: {
            title: "Programación de Cita",
            description: "Selecciona fecha y hora para tu servicio (horario disponible: 8am - 8pm).",
          },
        },
        {
          element: "#service-selection",
          popover: {
            title: "Catálogo de Servicios",
            description: "Explora y selecciona entre nuestra variedad de servicios disponibles.",
          },
        },
      ],
    },
    "/client/history": {
      steps: [
        {
          element: "#history-selection",
          popover: {
            title: "Historial de Servicios",
            description: "Revisa el registro completo de todos los servicios recibidos.",
          },
        },
        {
          element: "#actives-selection",
          popover: {
            title: "Servicios Activos",
            description: "Consulta el estado de tus servicios programados o en progreso.",
          },
        },
      ],
    },
    "/client/perfil": {
      steps: [
        {
          element: "#perfilClient",
          popover: {
            title: "Mi Perfil",
            description: "Revisa y actualiza tu información personal y preferencias.",
          },
        },
        {
          element: "#btn-edit-infoC",
          popover: {
            title: "Editar Perfil",
            description: "Modifica tus datos personales cuando sea necesario.",
          },
        },
        {
          element: "#form-editc",
          popover: {
            title: "Formulario de Actualización",
            description: "Actualiza tu información personal para mantenerla al día.",
          },
        },
        {
          element: "#Emailt",
          popover: {
            title: "Configuración de Email",
            description: "Para cambiar tu correo, visita la sección de Configuración de Cuenta.",
          },
        },
        {
          element: "#btn-save",
          popover: {
            title: "Guardar Información",
            description: "Confirma los cambios realizados en tu perfil.",
          },
        },
        {
          element: "#btn-cancel",
          popover: {
            title: "Descartar Cambios",
            description: "Cancela las modificaciones sin guardar.",
          },
        },
        {
          element: "#section-vehicles",
          popover: {
            title: "Mis Vehículos",
            description: "Administra el registro de tus vehículos asociados a la cuenta.",
          },
        },
        {
          element: "#btn-addVehicle",
          popover: {
            title: "Agregar Vehículo",
            description: "Registra un nuevo vehículo para agilizar futuras reservas.",
          },
        },
      ],
    },
    "/client/config": {
      steps: [
        {
          element: "#btn-dark",
          popover: {
            title: "Preferencias Visuales",
            description: "Personaliza la apariencia de la plataforma según tu gusto.",
          },
        },
        {
          element: "#btn-changes-password",
          popover: {
            title: "Seguridad de Cuenta",
            description: "Actualiza tu contraseña periódicamente para mayor protección.",
          },
        },
        {
          element: "#btn-changes-email",
          popover: {
            title: "Actualización de Email",
            description: "Cambia tu dirección de correo electrónico principal.",
          },
        },
      ],
    },
  };

  const currentTourConfig = tourConfig[pathname];
  if (currentTourConfig) {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      steps: currentTourConfig.steps,
    });

    driverObj.drive();
  }
};

export default TourGuide;
