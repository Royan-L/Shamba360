import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLeaf, FaChartLine, FaBoxes } from "react-icons/fa";

import Logo from "../components/Logo";
import Card from "../components/Card";
import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";

import { login } from "../services/authService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center bg-green-700 p-16 text-white">
        <Logo />

        <h2 className="mt-10 text-5xl font-bold leading-tight">
          Smart Farm <br /> Management
        </h2>

        <p className="mt-6 max-w-md text-green-100 text-lg">
          Manage harvests, inventory, sales, customers and reports from one
          modern platform.
        </p>

        <div className="mt-12 flex gap-8 text-center">
          <div>
            <FaLeaf size={40} />
            <p className="mt-3">Harvests</p>
          </div>

          <div>
            <FaBoxes size={40} />
            <p className="mt-3">Inventory</p>
          </div>

          <div>
            <FaChartLine size={40} />
            <p className="mt-3">Reports</p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center bg-gray-100 px-6">
        <div className="w-full max-w-md">
          <Card>
            <h2 className="mb-2 text-3xl font-bold text-gray-800">
              Welcome Back
            </h2>

            <p className="mb-8 text-gray-500">
              Sign in to continue to Shamba360
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
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Login;