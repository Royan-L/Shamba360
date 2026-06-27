import { Routes, Route, Navigate } from "react-router-dom";


import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import CustomerPortal from "../pages/CustomerPortal";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/staff-login" replace />} />

      <Route path="/login" element={<Navigate to="/staff-login" replace />} />
      <Route path="/staff-login" element={<Login portal="staff" />} />
      <Route path="/customer-login" element={<Login portal="customer" />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["manager", "operator"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerPortal />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
