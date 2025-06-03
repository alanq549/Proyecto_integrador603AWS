import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface Servicio {
  nombre: string;
  precio: number;
  duracion: number | null;
}

interface TicketModalProps {
  visible: boolean;
  onClose: () => void;
  datos: {
    cliente: string;
    vehiculo: string;
    servicios: Servicio[];
    serviciosTexto: string;
    precio: number;
    fecha: string;
    notas: string;
    idOrden?: number;
    duracionTotal?: number;
  };
}

const TicketModal = ({ visible, onClose, datos }: TicketModalProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (visible && datos) {
      generateQrCode();
    }
  }, [visible, datos]);

  const generateQrCode = async () => {
    try {
      const qrText = JSON.stringify({
        ...datos,
        timestamp: new Date().toISOString(),
      });
      const url = await QRCode.toDataURL(qrText, {
        width: 200,
        margin: 1,
        color: {
          dark: "#1a365d",
          light: "#ffffff",
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error("Error generando QR:", err);
    }
  };

  const handleDownload = async () => {
    if (!datos || !datos.cliente || !datos.servicios?.length) {
      alert("El ticket aún no está listo. Intenta de nuevo.");
      return;
    }

    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [95, 150],
      });

      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 54, 93);

      doc.setFontSize(14);
      doc.text("AUTOLAVADO MARTINEZ", 40, 10, { align: "center" });

      doc.setFontSize(10);

      doc.setFontSize(12);
      doc.text("TICKET DE SERVICIO", 40, 20, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`No. Folio: ${datos.idOrden || "N/A"}`, 10, 28);
      doc.text(`Fecha: ${datos.fecha}`, 10, 33);
      doc.text("------------------------------------------------------------------", 10, 36);

      doc.setFont("helvetica", "bold");
      doc.text("Cliente:", 10, 42);
      doc.setFont("helvetica", "normal");
      doc.text(datos.cliente, 25, 42);

      doc.setFont("helvetica", "bold");
      doc.text("Vehículo:", 10, 47);
      doc.setFont("helvetica", "normal");
      doc.text(datos.vehiculo, 25, 47);

      // Servicios múltiples
      doc.setFont("helvetica", "bold");
      doc.text("Servicios:", 10, 52);
      let y = 57;
      doc.setFont("helvetica", "normal");
      datos.servicios.forEach((serv) => {
        doc.text(
          `• ${serv.nombre} (${serv.duracion ?? "?"}min) - $${serv.precio}`,
          12,
          y
        );
        y += 5;
      });

      doc.setFont("helvetica", "bold");
      doc.text("Notas:", 10, y);
      doc.setFont("helvetica", "normal");
      doc.text(datos.notas || "Ninguna", 25, y);
      y += 7;

      doc.text("------------------------------------------------------------------", 10, y);
      y += 5;

      doc.setFont("helvetica", "bold");
      doc.text("TOTAL:", 10, y);
      doc.text(`MX$ ${Number(datos.precio).toFixed(2)}`, 50, y, {
        align: "right",
      });
      y += 8;

      if (qrDataUrl) {
        doc.addImage(qrDataUrl, "PNG", 25, y, 30, 30);
        y += 35;
      }

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("¡Gracias por su preferencia!", 40, y, { align: "center" });
      doc.text("www.autolavadomartinez.com", 40, y + 5, { align: "center" });

      doc.save(`ticket_${datos.idOrden || Date.now()}.pdf`);
    } catch (err) {
      console.error("Error al generar PDF:", err);
      alert("Hubo un error al generar el ticket");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden dark:bg-gray-800">
        <div className="bg-blue-800 p-4 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Ticket de Servicio
          </h2>
          {datos.idOrden && (
            <p className="text-sm opacity-80">Folio #: {datos.idOrden}</p>
          )}
        </div>

        <div className="p-6 text-sm space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold text-gray-600 dark:text-gray-200">Cliente:</span>
            <span>{datos.cliente}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold text-gray-600 dark:text-gray-200">Vehículo:</span>
            <span>{datos.vehiculo}</span>
          </div>

          <div className="border-b pb-2">
            <p className="font-semibold text-gray-600 dark:text-gray-200 mb-1">Servicios:</p>
            <ul className="list-disc list-inside space-y-1">
              {datos.servicios.map((s, i) => (
                <li key={i}>
                  {s.nombre} ({s.duracion ?? "?"}min) - MX$ {Number(s.precio).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold text-gray-600 dark:text-gray-200">Precio Total:</span>
            <span className="font-bold">MX$ {Number(datos.precio).toFixed(2)}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold text-gray-600 dark:text-gray-200">Fecha:</span>
            <span>{datos.fecha}</span>
          </div>

          <div>
            <p className="font-semibold text-gray-600 mb-1 dark:text-gray-200">Notas:</p>
            <p className="bg-gray-50 p-2 rounded text-sm dark:bg-gray-700">
              {datos.notas || "Ninguna"}
            </p>
          </div>

          {qrDataUrl && (
            <div className="mt-4 flex flex-col items-center">
              <p className="text-xs text-gray-500 mb-2 dark:text-gray-300">Código QR de verificación</p>
              <img src={qrDataUrl} alt="QR Code" className="w-32 h-32 border border-gray-200 rounded" />
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded dark:bg-gray-700 dark:text-white"
            >
              Cerrar
            </button>
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900"
            >
              {isGenerating ? "Generando..." : "Descargar Ticket"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
