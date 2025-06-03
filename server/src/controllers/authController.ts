// src/controllers/authController.ts
import { getPrisma } from "../utils/prismaClient";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  passwordResetTemplate,
  emailChangeTemplate,
  accountVerificationTemplate,
} from "../templates/emails";
import {
  generateCode,
  sendEmail,
  getUserEmail,
} from "../services/email.service";

dotenv.config();

// Definimos la interfaz del cuerpo del request
interface RegisterUserRequestBody {
  email: string;
  password: string;
}
// Handler para el registro de usuario con rol cliente
export const registerUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, password, nombre, apellido_paterno, apellido_materno } =
    req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }
  const prisma = await getPrisma();

  try {
    // Verificar si el usuario ya existe (incluso si no está verificado)
    const existingUser = await prisma.usuarios.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está en uso" });
    }

    // Hash del password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario PERO con un estado "no verificado" (podrías agregar un campo "verified: false" si lo necesitas)
    const newUser = await prisma.usuarios.create({
      data: {
        email,
        password: hashedPassword,
        rol: "cliente",
        nombre,
        apellido_paterno,
        apellido_materno,
      },
    });

    // Generar token de verificación (usando tu función existente)
    const token = generateCode(); // Código de 6 dígitos
    const hashedToken = await bcrypt.hash(token, 10); // Hasheamos el token

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 horas de validez

    await prisma.verificationtokens.create({
      data: {
        userId: newUser.id_usuario,
        token: hashedToken, // Guardás el token hasheado
        type: "email_verification", // Nuevo tipo para distinguirlo
        expiresAt,
      },
    });

    // Enviar email de verificación (usando tu función sendEmail)
    await sendEmail(
      email,
      "Verifica tu correo electrónico",
      `Tu código de verificación es: ${token}`, // Texto plano por si el cliente no soporta HTML
      accountVerificationTemplate(token)
    );

    return res.status(201).json({
      message: "Usuario registrado. Por favor verifica tu correo.",
      userId: newUser.id_usuario,
    });
  } catch (error: any) {
    console.error("Error al crear el usuario:", error.code);
    return res.status(500).json({ error: "Error al crear el usuario" });
  }
};

// Handler para el registro de usuario con rol administrador
export const registerAdmin = async (
  req: Request<{}, {}, RegisterUserRequestBody>,
  res: Response
): Promise<Response> => {
  const prisma = await getPrisma();

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  try {
    const existingUser = await prisma.usuarios.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "El email ya está en uso" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.usuarios.create({
      data: {
        email,
        password: hashedPassword,
        rol: "admin", // Rol de administrador
      },
    });

    return res
      .status(201)
      .json({ message: "Administrador creado con éxito", user: newAdmin });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.code, message: "Error al crear el administrador" });
  }
};
///verificar el Email de crecion
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;
  const prisma = await getPrisma();

  // Buscar todos los tokens válidos para verificación de email
  const validTokens = await prisma.verificationtokens.findMany({
    where: {
      used: false,
      expiresAt: { gt: new Date() },
      type: "email_verification",
    },
    include: { usuarios: true },
  });

  let matchedTokenRecord = null;

  for (const record of validTokens) {
    const match = await bcrypt.compare(token, record.token);
    if (match) {
      matchedTokenRecord = record;
      break;
    }
  }

  if (!matchedTokenRecord) {
    return res.status(400).json({ error: "Token inválido o expirado" });
  }

  // Verificación exitosa: actualizar usuario
  await prisma.usuarios.update({
    where: { id_usuario: matchedTokenRecord.userId },
    data: {
      fecha_creacion: new Date(), // o campo "verified": true
    },
  });

  // Marcar token como usado
  await prisma.verificationtokens.update({
    where: { id: matchedTokenRecord.id },
    data: { used: true },
  });

  return res.json({ message: "Correo verificado correctamente" });
};

/// api para el login de usuario
export const loginUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, password } = req.body;
  const prisma = await getPrisma();

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }
  try {
    // Buscar al usuario por el email
    const user = await prisma.usuarios.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }
    // Crear un JWT
    const token = jwt.sign(
      { userId: user.id_usuario, role: user.rol }, // Incluir el rol en el payload
      process.env.JWT_SECRET || "mi_clave_secreta",
      { expiresIn: "1h" }
    );

    // Verifica la respuesta que vas a enviar
    console.log("Datos del usuario que se enviarán:", {
      id: user.id_usuario,
      email: user.email,
      rol: user.rol,
    });

    // Responder con el token y el rol
    return res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id_usuario,
        email: user.email,
        rol: user.rol, // Aquí mandas el rol
      },
    });
  } catch (error: any) {
    console.error("Error en loginUser:", error.code);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Endpoint para solicitar cambio de password o email
export const requestChange = async (req: Request, res: Response) => {
  const { userId, type, newEmail } = req.body;
  const prisma = await getPrisma();

  if (!["password_reset", "email_change"].includes(type)) {
    return res.status(400).json({ error: "Tipo inválido" });
  }

  const token = generateCode();
  const hashedToken = await bcrypt.hash(token, 10); // Token encriptado, se guarda

  const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 mins

  await prisma.verificationtokens.create({
    data: {
      userId,
      token: hashedToken,
      type,
      newEmail: type === "email_change" ? newEmail : null,
      expiresAt,
    },
  });

  const subject =
    type === "password_reset"
      ? "Cambio de contraseña"
      : "Confirmación de correo";

  const text =
    type === "password_reset"
      ? `Tu código para el cambio de contraseña:\n\n${token}`
      : `Tu código para la confirmación de cambio de correo:\n\n${token}`;

  const html =
    type === "password_reset"
      ? passwordResetTemplate(token)
      : emailChangeTemplate(token, newEmail!);

  await sendEmail(
    type === "password_reset" ? await getUserEmail(userId) : newEmail!,
    subject,
    text,
    html
  );

  return res.json({ message: "Correo enviado" });
};

///verificar :
export const verifyAndChange = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const prisma = await getPrisma();

  const validTokens = await prisma.verificationtokens.findMany({
    where: {
      used: false,
      expiresAt: { gt: new Date() },
    },
    include: { usuarios: true },
  });

  let tokenRecord = null;

  for (const record of validTokens) {
    const match = await bcrypt.compare(token, record.token);
    if (match) {
      tokenRecord = record;
      break;
    }
  }

  if (!tokenRecord)
    return res.status(400).json({ error: "Token inválido o expirado" });

  if (tokenRecord.type === "password_reset") {
    // Cambiar contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10); // implementa bcrypt o similar

    await prisma.usuarios.update({
      where: { id_usuario: tokenRecord.userId },
      data: { password: hashedPassword },
    });
  } else if (tokenRecord.type === "email_change") {
    // Cambiar correo
    await prisma.usuarios.update({
      where: { id_usuario: tokenRecord.userId },
      data: { email: tokenRecord.newEmail! },
    });
  }

  // Marcar token como usado
  await prisma.verificationtokens.update({
    where: { id: tokenRecord.id },
    data: { used: true },
  });

  return res.json({ message: "Actualización realizada correctamente" });
};
