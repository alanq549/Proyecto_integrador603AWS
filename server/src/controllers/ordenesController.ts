import { getPrisma } from "../utils/prismaClient";
import { Request, Response } from "express";



function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/// orden para cliente ocasional (vista admin)
export const crearOrdenClienteOcasional = async (
  req: Request,
  res: Response
) => {
  const {
    nombre,
    telefono,
    placa,
    marca,
    modelo,
    color,
    idServicios,
    idCajon,
    fechaInicio,
    notas,
    metodoPago,
  } = req.body;
      const prisma = await getPrisma();
  

  if (
    !nombre?.trim() ||
    !telefono?.trim() ||
    !placa?.trim() ||
    !idServicios ||
    !Array.isArray(idServicios) ||
    idServicios.length === 0 ||
    !fechaInicio
  ) {
    return res
      .status(400)
      .json({ error: "Faltan datos obligatorios o formato inválido." });
  }

  const serviciosInt = idServicios.map((id: any) => parseInt(id));
  if (serviciosInt.some(isNaN)) {
    return res.status(400).json({ error: "IDs de servicios inválidos." });
  }

  const fecha = new Date(fechaInicio);
  if (isNaN(fecha.getTime())) {
    return res.status(400).json({ error: "Fecha inválida." });
  }

  try {
    // Crear usuario temporal
    const usuarioTemporal = await prisma.usuarios.create({
      data: {
        nombre,
        email: `${Date.now()}-${telefono}@ocasional.local`,
        password: "temporal",
        rol: "cliente",
      },
    });

    // Crear vehículo
    const vehiculo = await prisma.vehiculos.create({
      data: {
        id_usuario: usuarioTemporal.id_usuario,
        placa,
        marca,
        modelo,
        color,
      },
    });

    // Calcular duración total y precio total
    let duracionTotalMin = 0;
    let totalMonto = 0;

    for (const idServicio of serviciosInt) {
      const servicio = await prisma.servicios.findUnique({
        where: { id_servicio: idServicio },
      });
      if (!servicio) {
        return res
          .status(404)
          .json({ error: `Servicio con ID ${idServicio} no encontrado.` });
      }
      duracionTotalMin += servicio.duracion_estimada || 0;
      totalMonto += Number(servicio.precio);
    }

    // Calcular fecha_fin sumando la duración total a fechaInicio
    const fechaFin = new Date(fecha);
    fechaFin.setMinutes(fechaFin.getMinutes() + duracionTotalMin);
    console.log("Fecha fin calculada:", fechaFin);

    // Crear orden con fecha_fin
    const orden = await prisma.ordenes.create({
      data: {
        id_vehiculo: vehiculo.id_vehiculo,
        id_cajon: null,
        fecha_inicio: fecha,
        fecha_fin: fechaFin,
        estado: "pendiente",
        notas,
      },
    });

    // Crear relaciones en tabla pivote ordenes_servicios
    for (const idServicio of serviciosInt) {
      await prisma.ordenes_servicios.create({
        data: {
          id_orden: orden.id_orden,
          id_servicio: idServicio,
        },
      });
    }

    // Crear pago con monto total
    await prisma.pagos.create({
      data: {
        id_orden: orden.id_orden,
        monto: totalMonto,
        metodo: metodoPago || "efectivo",
        estado: "completado",
      },
    });

    res.status(201).json({
      message: "Orden registrada con cliente ocasional y múltiples servicios.",
      orden,
      totalMonto,
    });
  } catch (error: any) {
    console.error("Error creando orden ocasional con varios servicios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// orden para cliente registrado (vista admin)
export const crearOrdenClienteRegistrado = async (
  req: Request,
  res: Response
) => {
  const {
    idUsuario,
    placa,
    marca,
    modelo,
    color,
    idServicios,
    idVehiculo,
    idCajon,
    fechaInicio,
    notas,
    metodoPago,
  } = req.body;
    const prisma = await getPrisma();

  if (
    !idUsuario ||
    !placa?.trim() ||
    !idServicios ||
    !Array.isArray(idServicios) ||
    idServicios.length === 0 ||
    !fechaInicio
  ) {
    return res
      .status(400)
      .json({ error: "Faltan datos obligatorios o formato inválido." });
  }

  const serviciosInt = idServicios.map((id: any) => parseInt(id));
  if (serviciosInt.some(isNaN)) {
    return res.status(400).json({ error: "IDs de servicios inválidos." });
  }

  const fecha = new Date(fechaInicio);
  if (isNaN(fecha.getTime())) {
    return res.status(400).json({ error: "Fecha inválida." });
  }

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: parseInt(idUsuario) },
    });

    if (!usuario || usuario.rol !== "cliente") {
      return res.status(404).json({ error: "Cliente no encontrado." });
    }

    let vehiculoId: number;

    if (idVehiculo) {
      const vehiculoExistente = await prisma.vehiculos.findFirst({
        where: {
          id_vehiculo: parseInt(idVehiculo),
          id_usuario: usuario.id_usuario,
        },
      });

      if (!vehiculoExistente) {
        return res
          .status(400)
          .json({ error: "Vehículo no pertenece al cliente." });
      }

      vehiculoId = vehiculoExistente.id_vehiculo;
    } else {
      const nuevoVehiculo = await prisma.vehiculos.create({
        data: {
          id_usuario: usuario.id_usuario,
          placa,
          marca,
          modelo,
          color,
        },
      });
      vehiculoId = nuevoVehiculo.id_vehiculo;
    }

    // Inicializar duracion y monto
    let duracionTotal = 0;
    let totalMonto = 0;

    // Crear orden primero sin fecha_fin
    const orden = await prisma.ordenes.create({
      data: {
        id_vehiculo: vehiculoId,
        id_cajon: idCajon ? parseInt(idCajon) : null,
        fecha_inicio: fecha,
        estado: "pendiente",
        notas,
      },
    });

    // Insertar relaciones y calcular duracion y monto
    for (const idServicio of serviciosInt) {
      const servicio = await prisma.servicios.findUnique({
        where: { id_servicio: idServicio },
      });

      if (!servicio) {
        return res
          .status(404)
          .json({ error: `Servicio con ID ${idServicio} no encontrado.` });
      }

      if (!servicio.duracion_estimada || servicio.duracion_estimada <= 0) {
        return res.status(400).json({
          error: `Duración inválida para servicio ${servicio.nombre}.`,
        });
      }

      duracionTotal += servicio.duracion_estimada;
      totalMonto += Number(servicio.precio);

      await prisma.ordenes_servicios.create({
        data: {
          id_orden: orden.id_orden,
          id_servicio: idServicio,
        },
      });
    }

    // Calcular fecha_fin sumando duracion total a fecha_inicio
    const fechaFin = addMinutes(fecha, duracionTotal);

    // Actualizar orden con fecha_fin
    await prisma.ordenes.update({
      where: { id_orden: orden.id_orden },
      data: { fecha_fin: fechaFin },
    });

    // Crear pago
    await prisma.pagos.create({
      data: {
        id_orden: orden.id_orden,
        monto: totalMonto,
        metodo: metodoPago || "efectivo",
        estado: "completado",
      },
    });

    res.status(201).json({
      message:
        "Orden registrada para cliente registrado con múltiples servicios.",
      orden: { ...orden, fecha_fin: fechaFin },
      totalMonto,
    });
    console.log("fecha calculada:", fechaFin);
  } catch (error: any) {
    console.error("Error creando orden para cliente registrado:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// orden desde el lado del cliente  (vista client)
export const crearOrdenDesdeCliente = async (req: Request, res: Response) => {
  const { idUsuario, idVehiculo, idServicios, fechaInicio, notas } = req.body;

  const isEmpty = (str?: string | null) => !str || str.trim().length === 0;
      const prisma = await getPrisma();
  

  // Validaciones básicas
  if (
    !idUsuario ||
    !idVehiculo ||
    !idServicios ||
    !Array.isArray(idServicios) ||
    idServicios.length === 0 ||
    !fechaInicio
  ) {
    return res
      .status(400)
      .json({ error: "Faltan datos obligatorios o formato inválido" });
  }

  const fecha = new Date(fechaInicio);
  if (isNaN(fecha.getTime())) {
    return res.status(400).json({ error: "Fecha inválida" });
  }

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: Number(idUsuario) },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (
      isEmpty(usuario.nombre) ||
      isEmpty(usuario.apellido_materno) ||
      isEmpty(usuario.apellido_paterno)
    ) {
      return res.status(400).json({
        error: "Debes completar nombre y apellidos correctamente",
      });
    }

    const vehiculo = await prisma.vehiculos.findFirst({
      where: {
        id_vehiculo: Number(idVehiculo),
        id_usuario: Number(idUsuario),
      },
    });

    if (!vehiculo) {
      return res
        .status(400)
        .json({ error: "Vehículo no pertenece al usuario" });
    }

    const serviciosInt = idServicios.map((id: any) => Number(id));
    if (serviciosInt.some(isNaN)) {
      return res.status(400).json({ error: "IDs de servicios inválidos" });
    }

    const orden = await prisma.ordenes.create({
      data: {
        id_vehiculo: Number(idVehiculo),
        fecha_inicio: fecha,
        estado: "pendiente",
            notas: notas || "Sin observaciones", // ✅ Ahora sí
      },
    });

    let duracionTotal = 0;
    let totalMonto = 0;

    for (const idServicio of serviciosInt) {
      const servicio = await prisma.servicios.findUnique({
        where: { id_servicio: idServicio },
      });

      if (!servicio) {
        return res
          .status(404)
          .json({ error: `Servicio con ID ${idServicio} no encontrado.` });
      }

      if (!servicio.duracion_estimada || servicio.duracion_estimada <= 0) {
        return res.status(400).json({
          error: `Duración inválida para servicio ${servicio.nombre}.`,
        });
      }

      duracionTotal += servicio.duracion_estimada;
      totalMonto += Number(servicio.precio);

      await prisma.ordenes_servicios.create({
        data: {
          id_orden: orden.id_orden,
          id_servicio: idServicio,
        },
      });
    }

    // Aquí usas la función auxiliar para calcular fecha_fin
    const fechaFin = addMinutes(fecha, duracionTotal);

    await prisma.ordenes.update({
      where: { id_orden: orden.id_orden },
      data: { fecha_fin: fechaFin },
    });

    await prisma.pagos.create({
      data: {
        id_orden: orden.id_orden,
        monto: totalMonto,
        metodo: "efectivo",
        estado: "pendiente",
      },
    });

    res.status(201).json({
      message: "Reserva realizada con éxito con múltiples servicios",
      orden: { ...orden, fecha_fin: fechaFin },
      totalMonto,
    });
  } catch (error: any) {
    console.error("Error al crear reserva:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/// ACTUALIZAR EL ESTADO DE LA ORDEN DE FORMA AUTOMATICA Y PASAR EN EL HYSTORIAL
export const actualizarEstadosOrdenes = async () => {
  const ahora = new Date();
      const prisma = await getPrisma();
  

  const resultado = await prisma.ordenes.updateMany({
    where: {
      estado: "pendiente",
      fecha_fin: {
        lte: ahora,
      },
    },
    data: {
      estado: "completado",
    },
  });

  console.log(`[INFO] Órdenes completadas automáticamente: ${resultado.count}`);
};

///historial de ordenes
export const getHistorialOrdenes = async (req: Request, res: Response) => {
      const prisma = await getPrisma();
  
  try {
    await actualizarEstadosOrdenes(); // Actualiza estados antes de responder

    const { estado, fecha_inicio, fecha_fin } = req.query;

    const where: any = {};

    if (estado) {
      where.estado = estado;
    }

    if (fecha_inicio && fecha_fin) {
      where.fecha_inicio = {
        gte: new Date(fecha_inicio as string),
        lte: new Date(fecha_fin as string),
      };
    }

    const ordenes = await prisma.ordenes.findMany({
      where,
      orderBy: {
        fecha_inicio: "desc",
      },
      include: {
        vehiculos: {
          include: {
            usuarios: true,
          },
        },
        servicios_ordenes: {
          include: {
            servicios: true,
          },
        },
      },
    });

    const ahora = new Date();

    // Formateamos los datos para el frontend
    const data = ordenes.map((orden: any) => {
      const minutosRestantes = orden.fecha_fin
        ? (orden.fecha_fin.getTime() - ahora.getTime()) / 60000
        : 0;

      const alertaProximaFinalizacion =
        orden.estado === "pendiente" &&
        minutosRestantes > 0 &&
        minutosRestantes <= 2;

      // Construimos string con todos los servicios de la orden
      const serviciosTexto = orden.servicios_ordenes
        .map(
          (os: any) =>
            `${os.servicios.nombre} - ${
              os.servicios.duracion_estimada ?? "?"
            }min`
        )
        .join(", ");

      return {
        id: orden.id_orden,
        cliente: `${orden.vehiculos.usuarios.nombre} ${
          orden.vehiculos.usuarios.apellido_materno || ""
        }`.trim(),
        vehiculo: `${orden.vehiculos.placa ?? "Sin placa"} (${
          orden.vehiculos.marca
        } ${orden.vehiculos.modelo})`,
        servicio: serviciosTexto,
        hora_inicio: orden.fecha_inicio.toISOString(),
        estado: orden.estado,
        alertaProximaFinalizacion,
      };
    });
    console.log("[INFO] Historial de órdenes obtenido:");

    res.json({ data });
  } catch (error: any) {
    console.error("[ERROR] getHistorialOrdenes:", error);
    res
      .status(500)
      .json({ message: "Error al obtener el historial de órdenes" });
  }
};

// GET /api/client/history/:idUsuario
export const getServiceHistory = async (req: Request, res: Response) => {
      const prisma = await getPrisma();
  
  const { id_usuario } = req.params;

  try {
    await actualizarEstadosOrdenes(); // Actualiza estados antes de responder

    const vehiculos = await prisma.vehiculos.findMany({
      where: {
        id_usuario: Number(id_usuario),
      },
      select: {
        id_vehiculo: true,
      },
    });

    const idsVehiculos = vehiculos.map((v) => v.id_vehiculo);

    if (idsVehiculos.length === 0) {
      return res.json({ data: [] });
    }

    const ordenes = await prisma.ordenes.findMany({
      where: {
        id_vehiculo: {
          in: idsVehiculos,
        },
      },
      include: {
        vehiculos: {
          include: {
            usuarios: true,
          },
        },
        servicios_ordenes: {
          include: {
            servicios: true,
          },
        },
      },
      orderBy: {
        fecha_inicio: "desc",
      },
    });

    const ahora = new Date();

    const data = ordenes.map((orden) => {
      const minutosRestantes = orden.fecha_fin
        ? (orden.fecha_fin.getTime() - ahora.getTime()) / 60000
        : 0;

      const alertaProximaFinalizacion =
        orden.estado === "pendiente" &&
        minutosRestantes > 0 &&
        minutosRestantes <= 2;

      const serviciosTexto = orden.servicios_ordenes
        .map(
          (os) =>
            `${os.servicios.nombre} - ${
              os.servicios.duracion_estimada ?? "?"
            }min`
        )
        .join(", ");

      return {
        id: orden.id_orden,
        cliente: `${orden.vehiculos.usuarios.nombre} ${
          orden.vehiculos.usuarios.apellido_materno || ""
        }`.trim(),
        vehiculo: `${orden.vehiculos.placa ?? "Sin placa"} (${
          orden.vehiculos.marca
        } ${orden.vehiculos.modelo})`,
        servicio: serviciosTexto,
hora_inicio: orden.fecha_inicio,
        estado: orden.estado,
        alertaProximaFinalizacion,
      };
    });

    return res.json({ data });
  } catch (error: any) {
    console.error("❌ Error al obtener historial de cliente:", error);
    return res
      .status(500)
      .json({ error: "Error interno al obtener historial de cliente" });
  }
};

// GET http://localhost:3000/api/client/ticket/:idOrden
export const getTicketDetails = async (req: Request, res: Response) => {
      const prisma = await getPrisma();
  
  const { idOrden } = req.params;

  try {
    const orden = await prisma.ordenes.findUnique({
      where: { id_orden: Number(idOrden) },
      include: {
        servicios_ordenes: {
          include: {
            servicios: true,
          },
        },
        vehiculos: {
          include: {
            usuarios: true,
          },
        },
      },
    });

    if (!orden) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    // Detalle de servicios como array
    const serviciosDetalle = orden.servicios_ordenes.map((os) => ({
      nombre: os.servicios?.nombre || "Servicio desconocido",
      precio: os.servicios?.precio || 0,
      duracion: os.servicios?.duracion_estimada || null,
    }));

    const serviciosTexto = serviciosDetalle
      .map((s) => `${s.nombre} - ${s.duracion ?? "?"}min`)
      .join(", ");

    const precioTotal = serviciosDetalle.reduce(
      (acc, s) => acc + Number(s.precio),
      0
    );

    const duracionTotal = serviciosDetalle.reduce(
      (acc, s) => acc + (s.duracion || 0),
      0
    );

    const ticketData = {
      idOrden: orden.id_orden,
      cliente: orden.vehiculos?.usuarios
        ? `${orden.vehiculos.usuarios.nombre} ${
            orden.vehiculos.usuarios.apellido_paterno || ""
          } ${orden.vehiculos.usuarios.apellido_materno || ""}`.trim()
        : "Cliente desconocido",
      vehiculo: orden.vehiculos
        ? `${orden.vehiculos.marca} ${orden.vehiculos.modelo} (${
            orden.vehiculos.placa || "Sin placa"
          })`
        : "Vehículo desconocido",
      servicios: serviciosDetalle, // se envía el array completo
      serviciosTexto, // además, una string formateada
      duracionTotal, // útil si lo usas en frontend
      precio: precioTotal,
      fecha: orden.fecha_inicio.toISOString(),
      estado: orden.estado || "pendiente",
      notas: orden.notas || "",
    };

    return res.json(ticketData);
  } catch (error: any) {
    console.error("❌ Error al obtener ticket:", error);
    return res.status(500).json({ error: "Error interno al obtener ticket" });
  }
};

// Devuelve las órdenes activas del día actual
export const obtenerOrdenesActivas = async (req: Request, res: Response) => {
      const prisma = await getPrisma();
  
  try {
    const ahora = new Date();
    const inicioDelDia = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
      0,
      0,
      0
    );
    const finDelDia = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
      23,
      59,
      59
    );

    const ordenesActivas = await prisma.ordenes.findMany({
      where: {
        estado: {
          in: ["pendiente", "completado"],
        },
        fecha_inicio: {
          gte: inicioDelDia,
          lte: finDelDia,
        },
      },
      include: {
        vehiculos: {
          include: {
            usuarios: true, // 👉 Para obtener el cliente
          },
        },
        servicios_ordenes: {
          include: {
            servicios: true, // 👉 Para obtener los nombres y duración
          },
        },
        pagos: true, // 👉 Para saber el estado del pago
      },
      orderBy: {
        fecha_inicio: "asc",
      },
    });

    // Formateo para enviar datos ya listos al frontend
    const data = ordenesActivas.map((orden) => {
      const serviciosTexto = orden.servicios_ordenes
        .map(
          (os) =>
            `${os.servicios.nombre} - ${
              os.servicios.duracion_estimada ?? "?"
            }min`
        )
        .join("\n");

      const cliente = orden.vehiculos?.usuarios
        ? `${orden.vehiculos.usuarios.nombre} ${
            orden.vehiculos.usuarios.apellido_materno || ""
          }`.trim()
        : "ocasional";

      const vehiculo = orden.vehiculos
        ? `${orden.vehiculos.placa ?? "Sin placa"} (${orden.vehiculos.marca} ${
            orden.vehiculos.modelo
          })`
        : "indefinido";

      return {
        id: orden.id_orden,
        cliente,
        vehiculo,
        servicio: serviciosTexto,
        hora_inicio: orden.fecha_inicio.toISOString(), // formato crudo
        estado: orden.estado,
        estado_pago:
          orden.pagos.length > 0 &&
          orden.pagos.every((p) => p.estado === "completado")
            ? "completado"
            : "pendiente",
      };
    });

    res.json({ data });
  } catch (error) {
    console.error("[ERROR] obtenerOrdenesActivas:", error);
    res
      .status(500)
      .json({ message: "No se pudieron obtener las órdenes activas" });
  }
};

/// sistema cancela automaticamente ordenes no pagadas a tiempo
export const cancelarOrdenesImpagas = async () => {
      const prisma = await getPrisma();
  
  const ahora = new Date();

  // 1. Buscar órdenes pendientes sin pagos completados
  const ordenesPendientes = await prisma.ordenes.findMany({
    where: {
      estado: "pendiente",
      fecha_inicio: { lte: ahora },
      pagos: {
        none: {
          estado: "completado",
        },
      },
    },
    include: {
      pagos: true,
    },
  });

  if (!ordenesPendientes.length) {
    console.log("✅ No hay órdenes impagas que cancelar");
    return;
  }

  // 2. Cancelar órdenes
  const updates = ordenesPendientes.map((orden) =>
    prisma.ordenes.update({
      where: { id_orden: orden.id_orden },
      data: {
        estado: "cancelado",
      },
    })
  );

  await Promise.all(updates);

  console.log(
    `⛔ Canceladas ${ordenesPendientes.length} órdenes por falta de pago`
  );
};

///administrador cancela orden manualmente
export const cancelarOrdenManual = async (req: Request, res: Response) => {
      const prisma = await getPrisma();
  
  const { id } = req.params;

  try {
    const ordenExistente = await prisma.ordenes.findUnique({
      where: { id_orden: parseInt(id) },
    });

    if (!ordenExistente) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    if (["completado", "cancelado"].includes(ordenExistente.estado ?? "")) {
      return res.status(400).json({
        message: `No se puede cancelar una orden que ya está "${ordenExistente.estado}"`,
      });
    }

    const ordenCancelada = await prisma.ordenes.update({
      where: { id_orden: parseInt(id) },
      data: { estado: "cancelado" },
    });

    res.json({ message: "Orden cancelada", orden: ordenCancelada });
  } catch (error) {
    console.error("[ERROR] cancelarOrdenManual:", error);
    res.status(500).json({ message: "No se pudo cancelar la orden" });
  }
};


/// administrador confirma pago de orden
export const confirmarPagoOrden = async (req: Request, res: Response) => {
      const prisma = await getPrisma();
  
  const { idOrden } = req.params;

  try {
    const pagoActualizado = await prisma.pagos.updateMany({
      where: {
        id_orden: parseInt(idOrden),
        estado: "pendiente",
      },
      data: {
        estado: "completado",
        fecha_pago: new Date(),
      },
    });

    res.json({
      message: "Pago confirmado correctamente",
      pagosActualizados: pagoActualizado,
    });
  } catch (error) {
    console.error("[ERROR] confirmarPagoOrden:", error);
    res.status(500).json({ message: "Error al confirmar el pago de la orden" });
  }
};
