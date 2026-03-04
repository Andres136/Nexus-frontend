import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PropTypes from 'prop-types';
import NexusLoader from "../components/NexusLoader"


const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loadingUser } = useAuth({ middleware: "auth" });

  // 🔄 Mientras está validando token
  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NexusLoader text="Validando sesión..." />
      </div>
    );
  }

  //  No autenticado
  if (!user) return <Navigate to="/" replace />;

  //  Sin permiso
  if (!allowedRoles.includes(user.role_id)) {
    return <Navigate to="/auth/procesos" replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default ProtectedRoute;
