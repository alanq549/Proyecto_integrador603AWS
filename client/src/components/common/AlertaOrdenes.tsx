import { useEffect } from "react";
import toast from "react-hot-toast";

interface Orden {
  id: number;
  cliente: string;
  vehiculo: string;
  servicio: string;
  estado: string;
  alertaProximaFinalizacion: boolean;
}

const AlertaOrdenes = () => {
      const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const res = await fetch(`${API_URL}/ordenes/historial`);

        if (!res.ok) {
          throw new Error(`Error en la API: ${res.statusText}`);
        }

        const json = await res.json();

        // Validar que el contenido sea un array
        const ordenesData: Orden[] = Array.isArray(json?.data) ? json.data : [];

        const ordenesConAlerta = ordenesData.filter(
          (orden: Orden) => orden.alertaProximaFinalizacion
        );

        ordenesConAlerta.forEach((orden) => {
          toast(`⏰ Orden #${orden.id} está por finalizar`, {
            icon: "⚠️",
            duration: 8000,
          });
        });
      } catch (error) {
        console.error("Error al obtener órdenes con alerta", error);
      }
    };

    fetchOrdenes(); // Ejecutar una vez al montar
    const intervalo = setInterval(fetchOrdenes, 60000); // Ejecutar cada 60s

    return () => clearInterval(intervalo); // Limpiar intervalo al desmontar
  }, []);

  return null; // No renderiza nada visible
};

export default AlertaOrdenes;
