import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "admin" | "cliente";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else if (!user || user.rol !== requiredRole) { 
      navigate("/login");
    }
  }, [navigate, token, user, user?.rol, requiredRole]);

  return <>{children}</>;
};

export default ProtectedRoute;
