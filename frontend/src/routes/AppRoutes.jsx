import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Inventory from "../pages/Inventory";
import Harvests from "../pages/Harvests";
import Orders from "../pages/Orders";
import Sales from "../pages/Sales";
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
        path="/inventory"
        element={
          <ProtectedRoute allowedRoles={["manager", "operator"]}>
            <Inventory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/harvests"
        element={
          <ProtectedRoute allowedRoles={["manager", "operator"]}>
            <Harvests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute allowedRoles={["manager", "operator"]}>
            <Orders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales"
        element={
          <ProtectedRoute allowedRoles={["manager", "operator"]}>
            <Sales />
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

