import { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); //PARA LA VISIVILIDAD DEL PASSWORD

  const togglePasswordVisibility = () => {
    //PARA LA VISIVILIDAD DEL PASSWORD
    setShowPassword(!showPassword);
  };

  const API_URL = import.meta.env.VITE_API_URL;
  console.log("API_URL:", API_URL);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Usuario recibido en login:", data.user);

      if (!response.ok) {
        toast.error(data.error || "Error al iniciar sesión");
        return;
      }
      console.log("Usuario recibido en login:", data.user);

      // Guardar el token en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Inicio de sesión exitoso");

      // Redirigir dependiendo del rol
      setTimeout(() => {
        if (data.user.rol === "cliente") {
          navigate("/client/dashboard");
        } else if (data.user.rol === "admin") {
          navigate("/admin/dashboard");
        }
      }, 1500);
      console.log("rol  login", data.user.rol);
    } catch (error) {
      console.error("Error en el login:", error);
      toast.error("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <ToastContainer
        position="top-right"
        autoClose={100}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="login-image-container">
        <div className="logo-title-row">
          <img src="/log.png" alt="logo" className="log_login" />
          <h1 className="title1">MARTINEZ</h1>
        </div>

        <p className="subtitle_login">Establecimento y autolavado</p>
        <img src="\logoooo.png" alt="car" className="login-image" />
      </div>

      <div className="login-form-container">
        <div className="login-card">
          <div className="login-header">
            <h1>¡Inicio de Sesión!</h1>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group_L">
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
            <button type="submit" className="login-button" disabled={loading}>
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
                "Iniciar sesión"
              )}
            </button>
          </form>
          <div className="login-footer">
            <p>
              ¿No tienes una cuenta?{" "}
              <Link to="/register" className="register-link">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
