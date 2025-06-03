import { Request, Response } from "express";
import { getPrisma } from "../utils/prismaClient";

// Crear nueva tarea
export const crearTarea = async (req: Request, res: Response) => {
  const prisma = await getPrisma();

  const { titulo, descripcion, fecha_limite, prioridad } = req.body;
  const id_asignado = Number(req.body.id_asignado); // Conversión segura

  // Verifica si es un número válido
  if (isNaN(id_asignado)) {
    console.warn("⚠️ id_asignado inválido:", req.body.id_asignado);
    return res
      .status(400)
      .json({ error: "El campo id_asignado debe ser un número válido" });
  }

  // Validación de campos obligatorios
  if (!titulo || !descripcion || !fecha_limite || !prioridad) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }

  try {
    // Buscar usuario asignado
    const usuarioAsignado = await prisma.usuarios.findUnique({
      where: { id_usuario: id_asignado },
    });

    console.log("👤 Usuario asignado encontrado:", usuarioAsignado);

    // Validación: usuario debe existir y ser admin
    if (!usuarioAsignado) {
      return res.status(404).json({ error: "Usuario asignado no encontrado" });
    }

    if (usuarioAsignado.rol !== "admin") {
      return res
        .status(400)
        .json({ error: 'El usuario asignado debe tener rol "admin"' });
    }

    // Crear tarea
    const tarea = await prisma.tareas.create({
      data: {
        titulo,
        descripcion,
        id_asignado,
        fecha_limite: new Date(fecha_limite),
        estado: "pendiente",
        prioridad,
      },
    });

    console.log("✅ Tarea creada correctamente:", tarea);
    return res.status(201).json(tarea);
  } catch (error) {
    console.error("💥 Error al crear la tarea:", error);
    return res
      .status(500)
      .json({ error: "Error al crear la tarea", details: error });
  }
};

export const obtenerTareas = async (req: Request, res: Response) => {
  const prisma = await getPrisma();

  const { adminId, estado } = req.query;

  try {
    const where: any = {};
    if (adminId) where.id_asignado = Number(adminId);
    if (estado) where.estado = estado; // FILTRAR POR ESTADO SI VIENE

    const tareas = await prisma.tareas.findMany({
      where,
      orderBy: { fecha_limite: "asc" },
    });

    return res.status(200).json(tareas);
  } catch (error) {
    return res.status(500).json({ error: "Error al obtener tareas" });
  }
};

// Cambiar estado de una tarea
export const actualizarEstado = async (req: Request, res: Response) => {
  const prisma = await getPrisma();

  const { id } = req.params;
  const { estado } = req.body;

  try {
    const tarea = await prisma.tareas.update({
      // Cambié de 'tarea' a 'tareas'
      where: { id_tarea: Number(id) },
      data: { estado },
    });

    return res.status(200).json(tarea);
  } catch (error) {
    return res.status(500).json({ error: "Error al actualizar tarea" });
  }
};

// Eliminar tarea
export const eliminarTarea = async (req: Request, res: Response) => {
  const prisma = await getPrisma();

  const { id } = req.params;

  try {
    await prisma.tareas.delete({
      // Cambié de 'tarea' a 'tareas'
      where: { id_tarea: Number(id) },
    });

    return res.status(200).json({ message: "Tarea eliminada" });
  } catch (error) {
    return res.status(500).json({ error: "Error al eliminar tarea" });
  }
};
