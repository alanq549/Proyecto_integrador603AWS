import { Link } from "react-router-dom";
import { 
  FaUserCircle, 
  FaHistory, 
  FaCar, 
  FaCalendarAlt, 
 /* FaCreditCard,*/
  FaCog,
  FaQuestionCircle
} from "react-icons/fa";

const Dashboard = () => {

  const cards = [
    {
      title: "Mi Perfil",
      description: "Administra tu información personal",
      icon: <FaUserCircle className="text-blue-500 text-3xl" />,
      path: "/client/perfil",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
      textColor: "text-blue-800",
      darkBg: "dark:bg-blue-900/20",
      darkHover: "dark:hover:bg-blue-900/30"
    },
    {
      title: "Historial de Servicios",
      description: "Revisa tus servicios anteriores",
      icon: <FaHistory className="text-purple-500 text-3xl" />,
      path: "/client/history",
      bgColor: "bg-purple-50",
      hoverColor: "hover:bg-purple-100",
      textColor: "text-purple-800",
      darkBg: "dark:bg-purple-900/20",
      darkHover: "dark:hover:bg-purple-900/30"
    },
    {
      title: "Mis Vehículos",
      description: "Administra tus vehículos registrados",
      icon: <FaCar className="text-green-500 text-3xl" />,
      path: "/client/perfil",
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-100",
      textColor: "text-green-800",
      darkBg: "dark:bg-green-900/20",
      darkHover: "dark:hover:bg-green-900/30"
    },
    {
      title: "Reservar Servicio",
      description: "Agenda un nuevo servicio",
      icon: <FaCalendarAlt className="text-orange-500 text-3xl" />,
      path: "/client/order",
      bgColor: "bg-orange-50",
      hoverColor: "hover:bg-orange-100",
      textColor: "text-orange-800",
      darkBg: "dark:bg-orange-900/20",
      darkHover: "dark:hover:bg-orange-900/30"
    },
   /* {
      title: "Métodos de Pago",
      description: "Administra tus formas de pago",
      icon: <FaCreditCard className="text-indigo-500 text-3xl" />,
      path: "/client/payment-methods",
      bgColor: "bg-indigo-50",
      hoverColor: "hover:bg-indigo-100",
      textColor: "text-indigo-800",
      darkBg: "dark:bg-indigo-900/20",
      darkHover: "dark:hover:bg-indigo-900/30"
    },*/
    {
      title: "Configuración",
      description: "Personaliza tu experiencia",
      icon: <FaCog className="text-gray-500 text-3xl" />,
      path: "/client/config",
      bgColor: "bg-gray-50",
      hoverColor: "hover:bg-gray-100",
      textColor: "text-gray-800",
      darkBg: "dark:bg-gray-700",
      darkHover: "dark:hover:bg-gray-600"
    }
  ];

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Bienvenido a tu Panel</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gestiona tus servicios, vehículos y configuración desde aquí
          </p>
        </div>

        {/* Tarjetas de Acción */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Link
              key={index}
              to={card.path}
              className={`p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-200 
                ${card.bgColor} ${card.hoverColor} ${card.darkBg} ${card.darkHover}
                dark:border-gray-700`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {card.icon}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold mb-1 ${card.textColor} dark:text-white`}>
                    {card.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {card.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Sección de Ayuda */}
        <div className="mt-12 bg-white rounded-xl p-6 shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <FaQuestionCircle className="text-blue-500 text-2xl" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">¿Necesitas ayuda?</h2>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Consulta nuestro centro de ayuda o contacta con soporte si tienes alguna pregunta.
          </p>
          <div className="mt-4 space-x-3">
            <Link 
              to="/client/contact" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Centro de ayuda
            </Link>
            <Link 
              to="/client/contact" 
              className="inline-block px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Contactar soporte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;