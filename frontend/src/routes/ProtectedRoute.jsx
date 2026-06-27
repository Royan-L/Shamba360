import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/staff-login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    const fallback = currentUser.role === "customer" ? "/customer" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}

export default ProtectedRoute;
