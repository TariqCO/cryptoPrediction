// components/PrivateRoute.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const currentUser = useSelector((s) => s.currentUser.user);

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
