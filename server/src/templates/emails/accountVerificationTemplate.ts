export const accountVerificationTemplate = (token: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificación de Cuenta - Estacionamiento Martinez</title>
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
      background-color: #059669;
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
      background-color: #d1fae5;
      color: #059669;
      border-radius: 6px;
      display: inline-block;
    }
    .highlight {
      font-weight: bold;
      color: #059669;
      background-color: #ecfdf5;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .footer {
      margin-top: 25px;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
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
    <img src="https://proyecto-integrador-603-1.onrender.com/log.png" alt="Estacionamiento Martinez" class="logo">
    <h1>Verificación de Cuenta</h1>
  </div>
  <div class="content">
    <p>¡Gracias por registrarte en <span class="highlight">Estacionamiento Martinez</span>!</p>
    <p>Para activar tu cuenta, por favor ingresa el siguiente código de verificación:</p>
    
    <div class="code-container">
      <div class="code">${token}</div>
    </div>
    
    <p class="info-text">Este código es válido por 15 minutos. Si no solicitaste esta cuenta, puedes ignorar este correo.</p>
    
    <p>Saludos cordiales,<br><strong>El equipo de Estacionamiento Martinez</strong></p>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Estacionamiento Martinez. Todos los derechos reservados.</p>
    <p><small>Este es un mensaje automático, por favor no respondas a este correo.</small></p>
  </div>
</body>
</html>
`;
