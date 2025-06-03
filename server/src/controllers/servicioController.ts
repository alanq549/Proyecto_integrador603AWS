// src/controllers/servicioController.ts
import { getPrisma } from "../utils/prismaClient";
import { Request, Response } from "express";

// Crear nuevo servicio
export const createService = async (req: Request, res: Response) => {
  const prisma = await getPrisma();

  try {
    const { nombre, tipo, descripcion, precio, duracion_estimada } = req.body;

    if (!nombre || !tipo || !precio) {
      return res
        .status(400)
        .json({ error: "Nombre, tipo y precio son obligatorios" });
    }

    if (!["lavado", "estacionamiento"].includes(tipo)) {
      return res
        .status(400)
        .json({ error: "Tipo inválido. Debe ser lavado o estacionamiento" });
    }

    const precioDecimal = parseFloat(precio);
    if (isNaN(precioDecimal)) {
      return res.status(400).json({ error: "Precio inválido" });
    }

    const newservice = await prisma.servicios.create({
      data: {
        nombre,
        tipo,
        descripcion,
        precio: precioDecimal,
        duracion_estimada,
        activo: true,
      },
    });

    return res.status(201).json(newservice);
  } catch (error) {
    console.error("💥 Error al crear servicio:", error);
    return res
      .status(500)
      .json({ error: "Error interno al crear el servicio" });
  }
};

// Actualizar servicio
export const updateService = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const prisma = await getPrisma();

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const { nombre, tipo, descripcion, precio, duracion_estimada, activo } =
    req.body;

  if (tipo && !["lavado", "estacionamiento"].includes(tipo)) {
    return res.status(400).json({ error: "Tipo inválido" });
  }

  if (precio && isNaN(parseFloat(precio))) {
    return res.status(400).json({ error: "Precio inválido" });
  }

  try {
    const servicioExistente = await prisma.servicios.findUnique({
      where: { id_servicio: id },
    });
    if (!servicioExistente) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    const servicioActualizado = await prisma.servicios.update({
      where: { id_servicio: id },
      data: {
        nombre,
        tipo,
        descripcion,
        precio: precio ? parseFloat(precio) : undefined,
        duracion_estimada,
        activo,
      },
    });

    return res.status(200).json(servicioActualizado);
  } catch (error) {
    console.error("💥 Error al actualizar servicio:", error);
    return res.status(500).json({ error: "Error al actualizar el servicio" });
  }
};

// Obtener todos los servicios (activos e inactivos)
export const getAllServicios = async (req: Request, res: Response) => {
  const prisma = await getPrisma();

  try {
    const servicios = await prisma.servicios.findMany({
      orderBy: { id_servicio: "desc" },
    });

    return res.status(200).json(servicios);
  } catch (error) {
    console.error("❌ Error al obtener todos los servicios:", error);
    return res.status(500).json({ error: "Error al obtener servicios" });
  }
};

// Obtener solo servicios activos
export const getServiciosActivos = async (req: Request, res: Response) => {
  const prisma = await getPrisma();

  try {
    const servicios = await prisma.servicios.findMany({
      where: { activo: true },
      orderBy: { id_servicio: "desc" },
    });

    return res.status(200).json(servicios);
  } catch (error) {
    console.error("❌ Error al obtener servicios activos:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener servicios activos" });
  }
};

// Obtener servicios con filtro opcional por activo
export const getServicios = async (req: Request, res: Response) => {
  const prisma = await getPrisma();

  try {
    const { activos } = req.query;

    const filter: any = {};
    if (activos === "true") filter.activo = true;
    else if (activos === "false") filter.activo = false;

    const servicios = await prisma.servicios.findMany({
      where: filter,
      orderBy: { id_servicio: "desc" },
    });

    return res.status(200).json(servicios);
  } catch (error) {
    console.error("❌ Error al obtener servicios:", error);
    return res.status(500).json({ error: "Error al obtener servicios" });
  }
};

// eliminar servicio
export const deleteService = async (req: Request, res: Response) => {
  const id_servicio = Number(req.params.id);
  const prisma = await getPrisma();

  if (isNaN(id_servicio)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const servicioExistente = await prisma.servicios.findUnique({
      where: { id_servicio: id_servicio },
    });
    if (!servicioExistente) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    await prisma.servicios.delete({ where: { id_servicio: id_servicio } });

    return res
      .status(200)
      .json({ message: "Servicio eliminado correctamente" });
  } catch (error) {
    console.error("💥 Error al eliminar servicio:", error);
    return res.status(500).json({ error: "Error al eliminar el servicio" });
  }
};

//// seccion de cajones:
