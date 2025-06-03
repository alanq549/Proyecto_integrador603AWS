import { useState } from "react";
import { Link } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/register.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); //PARA LA VISIVILIDAD DEL PASSWORD
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); //PARA LA VISIVILIDAD DEL PASSWORD
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"register" | "verify">("register");
  const [verificationCode, setVerificationCode] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const togglePasswordVisibility = () => {
    //PARA LA VISIVILIDAD DEL PASSWORD
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    //PARA LA VISIVILIDAD DEL PASSWORD
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar el usuario");
      }

      // Cambia esta línea para usar userId directamente
      if (!data.userId) {
        throw new Error("No se recibió el ID de usuario");
      }

      setUserId(data.userId); // Usa data.userId en lugar de data.user.id_usuario
      setStep("verify");
      toast.info("Código de verificación enviado a tu correo electrónico");
    } catch (error) {
      console.error("Error en el registro:", error);
      toast.error(error instanceof Error ? error.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || !userId) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: verificationCode,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Código inválido");
      }

      // Guarda el token de autenticación si lo devuelve el backend
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast.success("¡Cuenta verificada con éxito!");
      // Redirige después de 1.5 segundos
      setTimeout(() => {
        window.location.href = data.user.rol === "admin" ? "/admin" : "/client";
      }, 1500);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error de verificación"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="register-image-container">
        <div className="logo-title-row">
          <img src="/log.png" alt="logo" className="log_register" />
          <h1 className="title1">MARTINEZ</h1>
        </div>

        <p className="subtitle_register">Establecimiento y autolavado</p>
        <img src="\logoooo.png" alt="car" className="register-image" />
      </div>

      <div className="register-form-container">
        <div className="register-card">
          {step === "register" ? (
            <>
              <div className="register-header">
                <h1>¡Regístrate!</h1>
              </div>

              <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group_R">
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo electrónico"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group_R relative">
                  <label htmlFor="password">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Contraseña"
                      required
                      disabled={loading}
                      className="w-full pr-10" // Asegúrate de dejar espacio para el icono
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      disabled={loading}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group_R relative">
                  <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmar contraseña"
                      required
                      disabled={loading}
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="register-button"
                  disabled={loading}
                >
                  {loading ? (
                    <ThreeDots
                      height="20"
                      width="20"
                      radius="3"
                      color="#ffffff"
                      ariaLabel="three-dots-loading"
                      visible={true}
                    />
                  ) : (
                    "Registrarse"
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 ">
                  Verifica tu correo
                </h1>
                <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full"></div>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                <p className="text-gray-600 dark:text-gray-700 text-center">
                  Hemos enviado un código de verificación a <br />
                  <span className="font-semibold text-blue-600 ">{email}</span>
                </p>

                <div className="space-y-2">
                  <label
                    htmlFor="verificationCode"
                    className="block text-sm font-medium text-gray-700 "
                  >
                    Código de verificación
                  </label>
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Ingresa el código de 6 dígitos"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    disabled={loading}
                    maxLength={6}
                  />
                </div>

                <div className="flex flex-col space-y-3 pt-2">
                  <button
                    onClick={handleVerify}
                    disabled={
                      loading ||
                      !verificationCode ||
                      verificationCode.length < 6
                    }
                    className={`w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <ThreeDots
                          height="24"
                          width="24"
                          radius="3"
                          color="#4478DC"
                          ariaLabel="three-dots-loading"
                          visible={true}
                        />
                      </div>
                    ) : (
                      "Verificar cuenta"
                    )}
                  </button>

                  <button
                    onClick={() => setStep("register")}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    ← Volver al registro
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="register-footer">
            <p>
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="login-link">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
