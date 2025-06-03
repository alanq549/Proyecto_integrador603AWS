// src/controllers/adminController.ts
import { getPrisma } from "../utils/prismaClient";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";

console.log("🧠 adminController cargado correctamente");

console.log(
  "🧨 ESTE LOG DEBERÍA VERSE SI EL ARCHIVO ES CORRECTO para registerA"
);

// Registrar nuevo administrador
export const registerAdmin = async (req: Request, res: Response) => {
    const prisma = await getPrisma();

  console.log("🟢 registerAdmin está funcionando!");
  console.log("🧾 Body recibido:", req.body);

  try {
    console.log("🟢 BODY RECIBIDO COMPLETO:", req.body); // Asegúrate de que esto se imprima en la consola
    const { email, password, nombre, apellido_paterno, apellido_materno } =
      req.body;

    // Agrega más logs para ver si los valores están siendo extraídos correctamente
    console.log("🔍 Campos extraídos:", {
      email,
      nombre,
      apellido_paterno,
      apellido_materno,
    });

    // Validación básica
    if (!email || !password) {
      console.error("⚠️ Error: Email o contraseña faltantes mami ");
      return res
        .status(400)
        .json({ error: "Email y contraseña son requeridos" });
    }

    // Verificación si el usuario ya existe
    const existingUser = await prisma.usuarios.findUnique({
      where: { email },
      select: { id_usuario: true },
    });

    if (existingUser) {
      console.error("⚠️ Email ya registrado:", email);
      return res.status(400).json({ error: "Email ya registrado" });
    }

    // Lógica para crear el usuario
    const userData = {
      email,
      password: await bcrypt.hash(password, 10),
      nombre: nombre || null,
      apellido_paterno: apellido_paterno || null,
      apellido_materno: apellido_materno || null,
      rol: "admin" as const,
    };

    console.log("📦 Datos listos para insertar en la base de datos:", userData);
    console.log("🟢 BODY RECIBIDO COMPLETO:", req.body); // Verifica que aquí se impriman todos los campos correctamente

    console.log("🛠 Datos a guardar:", userData);

    // Guardar en la base de datos
    const newAdmin = await prisma.usuarios.create({
      data: userData,
    });

    console.log("✅ Usuario creado con éxito:", newAdmin);

    return res.status(201).json({
      success: true,
      message: "Administrador creado exitosamente",
      user: newAdmin,
    });
  } catch (error: any) {
    console.log(error.code);
    console.error("❌ Error en registerAdmin:", error);
    return res.status(500).json({
      error: "Error interno",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Obtener todos los usuarios (versión mejorada con diagnóstico)
export const getUsers = async (req: Request, res: Response) => {
    const prisma = await getPrisma();

  try {
    console.log("Intentando obtener usuarios..."); // Log de diagnóstico
    const users = await prisma.usuarios.findMany({
      select: {
        id_usuario: true,
        email: true,
        nombre: true,
        apellido_paterno: true,
        apellido_materno: true,
        rol: true,
        fecha_creacion: true,
      },
      orderBy: {
        fecha_creacion: "desc",
      },
    });

    console.log("Usuarios encontrados:", users); // Log de diagnóstico

    if (!users || users.length === 0) {
      return res.status(404).json({
        message: "No se encontraron usuarios",
        suggestion: 'Verifica que la tabla "usuarios" existe y contiene datos',
      });
    }

    return res.status(200).json(users);
  } catch (error: any) {
    console.error("Error al obtener usuarios:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

// Actualizar usuario ()
export const updateUser = async (req: Request, res: Response) => {
    const prisma = await getPrisma();

  const { id } = req.params;
  const { nombre, apellido_paterno, apellido_materno, rol } = req.body;

  try {
    const updatedUser = await prisma.usuarios.update({
      where: { id_usuario: Number(id) },
      data: {
        nombre,
        apellido_paterno,
        apellido_materno,
        rol: rol as "cliente" | "admin",
        // ⚠️ NOTA: No ponemos "email", así que aunque lo manden, no lo actualiza
      },
      select: {
        id_usuario: true,
        email: true, // lo puedes seguir mostrando
        nombre: true,
        apellido_paterno: true,
        apellido_materno: true,
        rol: true,
      },
    });

    return res.status(200).json({
      message: "Usuario actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar usuario
export const deleteUser = async (req: Request, res: Response) => {
    const prisma = await getPrisma();

  const { id } = req.params;

  try {
    // Verificar si el usuario tiene tareas asignadas
    const userTasks = await prisma.tareas.findMany({
      where: { id_asignado: Number(id) },
    });

    if (userTasks.length > 0) {
      return res.status(400).json({
        error: "No se puede eliminar el usuario porque tiene tareas asignadas",
      });
    }

    await prisma.usuarios.delete({
      where: { id_usuario: Number(id) },
    });

    return res.status(200).json({ message: "Usuario eliminado exitosamente" });
  } catch (error: any) {
    console.error("Error al eliminar usuario:", error.code);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const testConnection = async (req: Request, res: Response) => {
    const prisma = await getPrisma();

  try {
    // Consulta simple para verificar la conexión
    const result = await prisma.$queryRaw`SELECT 1+1 AS result`;
    return res.status(200).json({
      dbConnection: "OK",
      simpleQueryResult: result,
    });
  } catch (error: any) {
    console.log(error.code);
    return res.status(500).json({
      error: "Error de conexión a la base de datos",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

// Endpoint para obtener el perfil del usuario logueado
export const getUserProfile = async (req: Request, res: Response) => {
    const prisma = await getPrisma();

  try {
    console.log("Request received for user profile with ID:", req.params.id); // Log para verificar la ruta
    const userId = req.params.id as string;

    if (!userId) {
      return res.status(400).json({
        message: "ID de usuario no proporcionado",
      });
    }

    const user = await prisma.usuarios.findUnique({
      where: { id_usuario: parseInt(userId) },
      select: {
        id_usuario: true,
        nombre: true,
        apellido_paterno: true,
        apellido_materno: true,
        email: true,
        rol: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    console.log("User found:", user); // Log para mostrar los datos del usuario
    return res.status(200).json(user);
  } catch (error: any) {
    console.log(error.code);
    return res.status(500).json({
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const obtenerEstadisticas = async (req: Request, res: Response) => {
    const prisma = await getPrisma();

  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Total de usuarios
    const totalCustomers = await prisma.usuarios.count({
      where: {
        rol: "cliente",
      },
    });
    
    // Órdenes de hoy
    const todayOrders = await prisma.ordenes.count({
      where: {
        fecha_inicio: {
          gte: hoy,
        },
      },
    });

    // Servicios activos
    const activeServices = await prisma.servicios.count({
      where: {
        activo: true,
      },
    });

    // Tareas pendientes o en progreso
    const pendingTasks = await prisma.tareas.count({
      where: {
        estado: {
          in: ["pendiente", "en_progreso"],
        },
      },
    });

    return res.status(200).json({
      todayOrders,
      totalCustomers,
      activeServices,
      pendingTasks,
    });
  } catch (error: any) {
    console.log(error.code);
    return res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};
