import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "../pages/Login";
import AdminRoutes from "./AdminRoutes";

const AdminRoute = () => {
  const role = localStorage.getItem("role");
  return role === "admin" ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<AdminRoute />}>
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;