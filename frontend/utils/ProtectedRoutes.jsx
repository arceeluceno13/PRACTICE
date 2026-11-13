import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoutes = () => {
  const token = useSelector((state) => state.user.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
