import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/admin/Dashboard.css";

const Dashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayOrders: 0,
    totalCustomers: 0,
    activeServices: 0,
    pendingTasks: 0
  });
  type Tarea = {
    id_tarea: number;
    titulo: string;
    fecha_limite?: string;
    // agrega aquí otras propiedades si las hay
  };
  
  const [pendingTasksList, setPendingTasksList] = useState<Tarea[]>([]);


  // Simular carga de datos
useEffect(() => {
  const fetchStats = async () => {
    try {
const res = await fetch(`${API_URL}/estadisticas`);
      if (!res.ok) throw new Error('Error al cargar estadísticas');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error(error);
      // Opcional: podés mostrar un mensaje de error en UI
    } finally {
      setLoading(false);
    }
  };

  fetchStats();
}, []);

useEffect(() => {
  const fetchPendingTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/tasks?estado=pendiente`);
      if (!res.ok) throw new Error('Error al cargar tareas');
      const tareas = await res.json();
      setPendingTasksList(tareas);
    } catch (error) {
      console.error(error);
    }
  };
    console.log("cargado bine");

  fetchPendingTasks();
}, []);



  // Acciones rápidas
const quickActions = [
  { icon: '➕', title: 'Nueva Orden', link: '/admin/Order' },         // Acción directa
  { icon: '📊', title: 'Reporte', link: '/admin/Informes' },         // Visual y claro para informes
  { icon: '📜', title: 'Historial', link: '/admin/HistorialOrdenes' }, // Representa registros históricos
  { icon: '🔧', title: 'Agregar Servicio', link: '/admin/servicios' }  // Clásico para ajustes o herramientas
];


  return (
    <div className="admin-content">
      <div className="mb-8">
        <h1 className="content-title">Bienvenido, Administrador</h1>
        <p className="content-subtitle">
          Resumen general y acceso rápido - {new Date().toLocaleDateString()}
        </p>
      </div>

      {loading ? (
        <div className="dashboard-widgets">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="widget animate-pulse h-32"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Widgets principales */}
          <div className="dashboard-widgets">
            <div className="widget widget-primary">
              <div className="widget-icon">📋</div>
              <div>
                <h3>Órdenes hoy</h3>
                <p className="widget-value">{stats.todayOrders}</p>
                <Link to="/admin/Order" className="widget-link">
                  Ver todas →
                </Link>
              </div>
            </div>

            <div className="widget widget-secondary">
              <div className="widget-icon">👥</div>
              <div>
                <h3>Clientes</h3>
                <p className="widget-value">{stats.totalCustomers}</p>
                <Link to="/admin/usuarios" className="widget-link">
                  Administrar →
                </Link>
              </div>
            </div>

            <div className="widget widget-tertiary">
              <div className="widget-icon">🚙</div>
              <div>
                <h3>Servicios activos</h3>
                <p className="widget-value">{stats.activeServices}</p>
                <Link to="/admin/servicios" className="widget-link">
                  Ver detalles →
                </Link>
              </div>
            </div>

            <div className="widget widget-accent">
              <div className="widget-icon">⏳</div>
              <div>
                <h3>Tareas pendientes</h3>
                <p className="widget-value">{stats.pendingTasks}</p>
                <Link to="/admin/Tasks" className="widget-link">
                  Revisar →
                </Link>
              </div>
            </div>
          </div>        

          {/* Acciones rápidas */}
          <div className="mt-10">
            <h2 className="section-title">Acciones Rápidas</h2>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <Link 
                  key={index} 
                  to={action.link}
                  className="quick-action-card"
                >
                  <span className="action-icon">{action.icon}</span>
                  <span>{action.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recordatorios importantes */}
          <div className="mt-10">
  <h2 className="section-title">Recordatorios</h2>
  <div className="reminders-list">
    {pendingTasksList.length === 0 ? (
      <p>No hay tareas pendientes. 🎉</p>
    ) : (
      pendingTasksList.map((tarea) => (
        <div key={tarea.id_tarea} className="reminder-item">
          <div className="reminder-badge">!</div>
          <div>
            <p>{tarea.titulo}</p>
            <small className="reminder-date">
              {tarea.fecha_limite
                ? `Vence el ${new Date(tarea.fecha_limite).toLocaleDateString()}`
                : "Sin fecha límite"}
            </small>
          </div>
        </div>
      ))
    )}
  </div>
</div>

        </>
      )}
    </div>
  );
};

export default Dashboard;