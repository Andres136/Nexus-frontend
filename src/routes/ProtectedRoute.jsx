import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PropTypes from 'prop-types';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth({ middleware: "auth" });

  if (!user) return <Navigate to="/" replace />; // Si no está autenticado, redirigir al login

  if (!allowedRoles.includes(user.role_id)) {
    return <Navigate to="/auth/procesos" replace />; // Si no tiene permiso, redirigir
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default ProtectedRoute;
