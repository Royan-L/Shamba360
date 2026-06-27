import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBoxes, FaChartLine, FaLeaf, FaShoppingBasket, FaUserTie } from "react-icons/fa";

import Logo from "../components/Logo";
import Card from "../components/Card";
import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";
import useAuth from "../hooks/useAuth";

const DEMO_USERS = {
  staff: [
    { label: "Manager", email: "manager@shamba360.test" },
    { label: "Operator", email: "operator@shamba360.test" },
  ],
  customer: [
    { label: "Customer", email: "customer@shamba360.test" },
  ],
};

function Login({ portal = "staff" }) {
  const isCustomerPortal = portal === "customer";
  const [email, setEmail] = useState(isCustomerPortal ? "customer@shamba360.test" : "manager@shamba360.test");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password, portal);
      navigate(user.role === "customer" ? "/customer" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("Password123!");
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center bg-green-700 p-16 text-white">
        <Logo />

        <h2 className="mt-10 text-5xl font-bold leading-tight">
          {isCustomerPortal ? "Customer Produce Portal" : "Farm Operations Portal"}
        </h2>

        <p className="mt-6 max-w-md text-green-100 text-lg">
          {isCustomerPortal
            ? "Browse available produce, place orders, and follow your order status."
            : "Manage harvests, inventory, sales, customer orders, reports, and operator activity."}
        </p>

        <div className="mt-12 flex gap-8 text-center">
          <div>
            <FaLeaf size={40} />
            <p className="mt-3">Harvests</p>
          </div>

          <div>
            {isCustomerPortal ? <FaShoppingBasket size={40} /> : <FaBoxes size={40} />}
            <p className="mt-3">{isCustomerPortal ? "Orders" : "Inventory"}</p>
          </div>

          <div>
            <FaChartLine size={40} />
            <p className="mt-3">Reports</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-gray-100 px-6">
        <div className="w-full max-w-md">
          <Card>
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
              <Link
                to="/staff-login"
                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                  !isCustomerPortal ? "bg-white text-green-700 shadow-sm" : "text-gray-500"
                }`}
              >
                <FaUserTie /> Staff
              </Link>
              <Link
                to="/customer-login"
                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                  isCustomerPortal ? "bg-white text-green-700 shadow-sm" : "text-gray-500"
                }`}
              >
                <FaShoppingBasket /> Customer
              </Link>
            </div>

            <h2 className="mb-2 text-3xl font-bold text-gray-800">
              {isCustomerPortal ? "Customer Login" : "Farm Staff Login"}
            </h2>

            <p className="mb-8 text-gray-500">
              Sign in with one of the demo accounts or your assigned account.
            </p>

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="mb-4 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button onClick={handleLogin}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            <div className="mt-6 border-t border-gray-200 pt-5">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                Demo users
              </p>
              <div className="grid gap-2">
                {DEMO_USERS[portal].map((user) => (
                  <button
                    key={user.email}
                    type="button"
                    onClick={() => fillDemoUser(user.email)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 transition hover:border-green-500 hover:text-green-700"
                  >
                    {user.label}: {user.email}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Password for all demo users: Password123!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Login;
