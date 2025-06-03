import { Request, Response } from "express";
import { getPrisma } from "../utils/prismaClient";




// Actualizar datos del cliente
export const updateClient = async (req: Request, res: Response) => {
  const { id_usuario } = req.params;
  const { nombre, apellido_paterno, apellido_materno, email } = req.body;
      const prisma = await getPrisma();
  

  try {
    const user = await prisma.usuarios.update({
      where: { id_usuario: Number(id_usuario) },

      data: {
        nombre,
        apellido_paterno,
        apellido_materno,
        email,
      },
    });

    return res
      .status(200)
      .json({ message: "Perfil actualizado con éxito", user });
  } catch (error: any) {
    console.error("Error actualizando perfil:", error.code, error.message);
    return res.status(500).json({ error: "Error al actualizar el perfil" });
  }
};

// Dar de alta un vehículo para el cliente
export const addVehicle = async (req: Request, res: Response) => {
  const { id_usuario } = req.params;
  const { marca, modelo, anio, placa, color } = req.body;
  console.log("🔥 Agregando vehículo...");
      const prisma = await getPrisma();
  

  try {
    const userId = Number(id_usuario);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    // Validación opcional simple
    if (!marca || !modelo) {
      return res.status(400).json({ error: "Marca y modelo son obligatorios" });
    }

    // Validar que el cliente exista
    const user = await prisma.usuarios.findUnique({
      where: { id_usuario: userId },
    });

    if (!user) {
      console.log(`Cliente con ID ${id_usuario} no encontrado.`);
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Parsear el año si viene, permitir nulo
    const parsedAnio = anio && anio !== "" ? Number(anio) : null;

    const newVehicle = await prisma.vehiculos.create({
      data: {
        id_usuario: userId,
        marca,
        modelo,
        anio: parsedAnio,
        placa: placa || null,
        color: color || null,
      },
    });

    console.log("🚗 Vehículo creado con éxito:", newVehicle);

    return res.status(201).json({
      message: "Vehículo registrado con éxito",
      vehicle: newVehicle,
    });
  } catch (error: any) {
    if (error?.code === "P2002" && error?.meta?.target?.includes("placa")) {
      return res.status(409).json({ error: "La placa ya está registrada" });
    }

    console.error("❌ Error al agregar vehículo:", error.code || error.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener vehículos por ID de usuario
export const getVehiclesByUserId = async (req: Request, res: Response) => {
  const { id_usuario } = req.params;
      const prisma = await getPrisma();
  

  try {
    const userId = Number(id_usuario);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    const vehicles = await prisma.vehiculos.findMany({
      where: { id_usuario: userId },
    });

    if (vehicles.length === 0) {
      return res
        .status(404)
        .json({ message: "Este usuario no tiene vehículos registrados" });
    }

    return res.status(200).json({ vehicles });
  } catch (error: any) {
    console.error("❌ Error al obtener vehículos del usuario:", error.code);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener todos los vehículos (sin filtro por usuario)
export const getAllVehicles = async (req: Request, res: Response) => {
      const prisma = await getPrisma();
  
  try {
    const vehicles = await prisma.vehiculos.findMany({
      orderBy: {
        id_vehiculo: "desc", // ordenar por id_vehiculo descendente
      },
    });

    return res.status(200).json({ vehicles });
  } catch (error: any) {
    console.error("❌ Error al obtener vehículos:", error.code);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// 🔍 Buscar cliente registrado por nombre o email
export const buscarClienteRegistrado = async (req: Request, res: Response) => {
  const { query } = req.query;
      const prisma = await getPrisma();
  

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Parámetro de búsqueda inválido." });
  }

  try {
    const clientes = await prisma.usuarios.findMany({
      where: {
        OR: [{ nombre: { contains: query } }, { email: { contains: query } }],
        rol: "cliente",
      },
      select: {
        id_usuario: true,
        nombre: true,
        apellido_paterno: true,
        email: true,
        vehiculos: true,
      },
    });

    if (clientes.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado." });
    }

    res.json({ clientes });
  } catch (error: any) {
    console.error("Error al buscar cliente:", error.code);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
