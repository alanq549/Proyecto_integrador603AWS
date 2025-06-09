import { Link } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../../components/common/ThemeContext"; // ajustá la ruta según tu estructura
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type SettingsKey = "notifications" | "twoFactorAuth";

const ConfiguracionAdmin = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  const [settings, setSettings] = useState({
    notifications: true,
    twoFactorAuth: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); //PARA LA VISIVILIDAD DEL PASSWORD
  const [showPassword, setShowPassword] = useState(false); //PARA LA VISIVILIDAD DEL PASSWORD
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const togglePasswordVisibility = () => {
    //PARA LA VISIVILIDAD DEL PASSWORD
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    //PARA LA VISIVILIDAD DEL PASSWORD
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleToggle = (field: SettingsKey) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simular guardado de configuración
    setTimeout(() => {
      console.log("Configuración guardada:", { ...settings, darkMode });
      setIsSaving(false);
      setSaveSuccess(true);
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [passwordStep, setPasswordStep] = useState<"input" | "verify">("input");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Enviar solicitud al backend
  const handleRequest = async (type: "password_reset" | "email_change") => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData?.id;

    if (!userId) {
      toast.error("No se pudo identificar al usuario");
      throw new Error("User ID not found");
    }

    try {
      const response = await fetch(`${API_URL}/request-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          userId,
          ...(type === "email_change" && { newEmail }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error en la solicitud");
      }

      toast.info(data.message || "Código de verificación enviado");
      return data;
    } catch (error) {
      toast.error("Error al enviar la solicitud");
      console.error("Error en handleRequest:", error);
      throw error;
    }
  };

  const handlePasswordChange = async () => {
    try {
      // Primero solicitar el código de verificación
      await handleRequest("password_reset");
      setPasswordStep("verify");
      toast.info("Código de verificación enviado a tu email");
    } catch (error) {
      toast.error("Error al solicitar el cambio de contraseña");
      console.error(error);
    }
  };

  const confirmPasswordChange = async () => {
    try {
      if (newPassword !== confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        return;
      }
      setLoading(true);

      const res = await fetch(`${API_URL}/verify-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: verificationCode,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Contraseña cambiada con éxito");
        setShowPasswordModal(false);
        setPasswordStep("input");
        setNewPassword("");
        setVerificationCode("");
      } else {
        throw new Error(data.error || "Error al cambiar la contraseña");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
      console.error(error);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail) {
      toast.error("Por favor ingresa un email válido");
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData?.id;

      const response = await fetch(`${API_URL}/request-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "email_change",
          userId,
          newEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error en la solicitud");
      }

      toast.info("Código de verificación enviado a tu nuevo email");
      setPasswordStep("verify"); // Reutilizamos el mismo flujo de verificación
    } catch (error) {
      toast.error("Error al solicitar cambio de email");
      console.error(error);
    }
  };

  const confirmEmailChange = async () => {
    try {
      const res = await fetch(`${API_URL}/verify-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: verificationCode,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Email cambiado con éxito");
        setShowEmailModal(false);
        setNewEmail("");
        setVerificationCode("");
        setPasswordStep("input");

        // Actualizar el email en el localStorage si es necesario
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        if (userData) {
          userData.email = newEmail;
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } else {
        throw new Error(data.error || "Error al cambiar el email");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
      console.error(error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-0 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <ToastContainer
        position="top-right"
        autoClose={1500}
        theme={darkMode ? "dark" : "light"}
        toastClassName="rounded-md shadow-lg"
      />

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">
            Configuración del Sistema
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Administra las preferencias y seguridad de tu cuenta
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden dark:bg-gray-800/95 dark:shadow-gray-900/30">
          {/* Sección de Preferencias */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-600 dark:text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              Preferencias
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/80 rounded-lg transition-colors">
                <div>
                  <label
                    htmlFor="notifications"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1"
                  >
                    Notificaciones por correo
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Recibir alertas y actualizaciones importantes
                  </p>
                </div>
                <button
                  onClick={() => handleToggle("notifications")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    settings.notifications
                      ? "bg-blue-600"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Botón modo oscuro controlado por Context */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/80 rounded-lg transition-colors"
          id="btn-dark"
>
                <div>
                  <label
                    htmlFor="darkMode"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1"
                  >
                    Modo oscuro
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Activar interfaz con colores oscuros
                  </p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    darkMode ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Sección de Seguridad */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-600 dark:text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Seguridad
            </h2>

            <div className="space-y-4">
              <div>
              <Link
              id="btn-changes-password"
                to="#"
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/80 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/80 transition-colors"
              >
                <div >
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100">
                    Cambiar contraseña
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Actualiza tu contraseña regularmente
                  </p>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400 dark:text-gray-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                </svg>
              </Link>
              </div>


              <Link
              id="btn-changes-email"
                to="#"
                onClick={() => setShowEmailModal(true)}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/80 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/80 transition-colors"
              >
                <div >
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100">
                    Cambiar correo electrónico
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Actualiza tu dirección de email
                  </p>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400 dark:text-gray-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Acciones */}
          <div className="p-6 sm:p-8 bg-gray-50 dark:bg-gray-700/80 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            {saveSuccess && (
              <div className="mr-auto flex items-center text-sm text-green-600 dark:text-green-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Configuración guardada correctamente
              </div>
            )}
{/** 
            <button
              onClick={() =>
                setSettings({
                  notifications: true,
                  twoFactorAuth: false,
                })
              }
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Restablecer
            </button>
            */}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de cambio de contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Cambiar Contraseña
              </h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordStep("input");
                  setNewPassword("");
                  setConfirmPassword("");
                  setVerificationCode("");
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {passwordStep === "input" ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nueva contraseña
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Ingresa tu nueva contraseña"
                    />
                    {newPassword.length > 0 && newPassword.length < 8 && (
                      <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                        La contraseña debe tener al menos 8 caracteres
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      disabled={loading}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirmar contraseña
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                        confirmPassword && newPassword !== confirmPassword
                          ? "border-red-500 focus:ring-red-500 dark:border-red-400"
                          : "border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                      }`}
                      placeholder="Confirma tu nueva contraseña"
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                        Las contraseñas no coinciden
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={() => {
                        setShowPasswordModal(false);
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handlePasswordChange}
                      disabled={
                        !newPassword ||
                        !confirmPassword ||
                        newPassword !== confirmPassword ||
                        newPassword.length < 8
                      }
                      className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        !newPassword ||
                        !confirmPassword ||
                        newPassword !== confirmPassword
                          ? "bg-blue-400 cursor-not-allowed dark:bg-blue-500"
                          : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
                      }`}
                    >
                      Enviar código
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Hemos enviado un código de verificación a tu correo
                    electrónico. Por favor ingrésalo a continuación:
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Código de verificación
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Ingresa el código de 6 dígitos"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={() => {
                        setPasswordStep("input");
                        setVerificationCode("");
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                    >
                      Volver
                    </button>
                    <button
                      onClick={confirmPasswordChange}
                      disabled={
                        !verificationCode || verificationCode.length < 6
                      }
                      className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        !verificationCode || verificationCode.length < 6
                          ? "bg-green-400 cursor-not-allowed dark:bg-green-500"
                          : "bg-green-600 hover:bg-green-700 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800"
                      }`}
                    >
                      Confirmar cambio
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de cambio de correo */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Cambiar Correo Electrónico
              </h2>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {passwordStep === "input" ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label></label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nuevo correo electrónico
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Ingresa tu nuevo correo"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={() => setShowEmailModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleEmailChange}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800"
                    >
                      Enviar código
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Hemos enviado un código de verificación a{" "}
                    <span className="font-medium">{newEmail}</span>. Por favor
                    ingrésalo a continuación:
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Código de verificación
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Ingresa el código"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={() => {
                        setPasswordStep("input");
                        setVerificationCode("");
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                    >
                      Volver
                    </button>
                    <button
                      onClick={confirmEmailChange}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-700 dark:hover:bg-green-800"
                    >
                      Confirmar cambio
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracionAdmin;
