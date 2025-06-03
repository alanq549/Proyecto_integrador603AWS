export const passwordResetTemplate = (token: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cambio de Contraseña - Estacionamiento Martinez</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #2563eb;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 15px;
        }
        .content {
            padding: 20px;
            background-color: #f9fafb;
            border-radius: 0 0 8px 8px;
            border: 1px solid #e5e7eb;
        }
        .code-container {
            text-align: center;
            margin: 25px 0;
        }
        .code {
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 3px;
            padding: 15px 25px;
            background-color: #e0e7ff;
            color: #2563eb;
            border-radius: 6px;
            display: inline-block;
        }
        .footer {
            margin-top: 25px;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
            font-weight: bold;
        }
        .info-text {
            color: #6b7280;
            font-size: 14px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <!-- Reemplaza con tu logo real -->
        <img src="https://proyecto-integrador-603-1.onrender.com/log.png" alt="Estacionamiento Martinez" class="logo">
        <h1>Cambio de Contraseña</h1>
    </div>
    <div class="content">
        <p>Hemos recibido una solicitud para cambiar tu contraseña. Utiliza el siguiente código para completar el proceso:</p>
        
        <div class="code-container">
            <div class="code">${token}</div>
        </div>
        
        <p class="info-text">Este código es válido por 15 minutos. Si no solicitaste este cambio, por favor ignora este mensaje o contacta con nuestro soporte.</p>
        
        <p>Atentamente,<br><strong>El equipo de Estacionamiento Martinez</strong></p>
    </div>
    <div class="footer">
        <p>© ${new Date().getFullYear()} Estacionamiento Martinez. Todos los derechos reservados.</p>
        <p><small>Este es un mensaje automático, por favor no respondas a este correo.</small></p>
    </div>
</body>
</html>
`;