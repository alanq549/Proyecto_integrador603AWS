import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Código numérico de 6 dígitos como string, ej: "426039"
export const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Enviar email (ejemplo simple)
export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Estacionamiento Martinez" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });
};

// Implementación de getUserEmail
export const getUserEmail = async (userId: number): Promise<string> => {
  const user = await prisma.usuarios.findUnique({
    where: { id_usuario: userId },
    select: { email: true },
  });
  if (!user || !user.email) {
    throw new Error("Usuario no encontrado");
  }
  return user.email;
};
