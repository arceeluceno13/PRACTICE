import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoute = () => {
  const token = useSelector((state) => state.user.token);
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;
