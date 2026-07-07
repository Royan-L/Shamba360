import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaClipboardList, FaLeaf, FaLock, FaShoppingBasket } from "react-icons/fa";

import Button from "../components/Button";
import Input from "../components/Input";
import Logo from "../components/Logo";
import PasswordInput from "../components/PasswordInput";
import useAuth from "../hooks/useAuth";

function Login() {
  const [email, setEmail] = useState("manager@shamba360.test");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      navigate(user.role === "customer" ? "/buyers" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "That email or password doesn't match our records.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen overflow-hidden bg-slate-950">
      <aside className="relative hidden overflow-hidden bg-green-950 px-14 py-14 text-white lg:flex lg:w-[50%] xl:w-[54%] flex-col justify-between">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(34,197,94,0.25),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(20,83,45,0.8),transparent_36%)]" />
        <FaLeaf className="pointer-events-none absolute bottom-10 right-10 text-[260px] text-green-800/20" aria-hidden="true" />

        <div className="relative">
          <Logo tone="dark" />
        </div>

        <div className="relative">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-green-300">Welcome back</p>
          <h1 className="max-w-lg whitespace-pre-line text-[2.6rem] font-bold leading-[1.15] tracking-tight">
            {"One platform for managers, operators, and buyers."}
          </h1>
          <p className="mt-5 max-w-sm text-[15px] leading-7 text-green-100/75">
            Sign in to continue your workflow: manage farms, process orders, or track buyer collections.
          </p>

          <ul className="mt-10 space-y-4">
            <Feature icon={<FaClipboardList />} text="Keep produce, harvest, sales, and orders in sync" />
            <Feature icon={<FaLock />} text="Role-based access with farm-specific operator actions" />
            <Feature icon={<FaShoppingBasket />} text="Buyer experience from order placement to pickup" />
          </ul>
        </div>

        <p className="relative text-xs tracking-wide text-green-500/70">Shamba360 - Smart Farm Management</p>
      </aside>

      <main className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src="/public/farm-bg.png.jpg"
            alt=""
            className="h-full w-full object-cover scale-110"
            style={{ filter: "blur(6px) brightness(0.5)" }}
          />
          <div className="absolute inset-0 bg-white/30" />
        </div>

        <div className="relative mb-8 lg:hidden">
          <Logo />
        </div>

        <div
          className="relative w-full max-w-md rounded-2xl px-8 py-9 sm:px-10"
          style={{
            background: "rgba(255,255,255,0.84)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 24px 70px rgba(15,23,42,0.18)",
            border: "1px solid rgba(255,255,255,0.72)",
          }}
        >
          <div className="mb-7">
            <h2 className="text-[1.75rem] font-bold tracking-tight text-stone-950">Sign in to Shamba360</h2>
            <p className="mt-1.5 text-[14px] text-stone-500">Access your manager, operator, or customer account.</p>
            <p className="mt-2 text-sm text-stone-600">
              New here?{" "}
              <Link to="/signup" className="font-semibold text-green-800 hover:text-green-900">
                Create an account
              </Link>
            </p>
          </div>

          <div className="space-y-5">
            <Input
              label="Email"
              placeholder="name@example.com"
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
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </p>
            )}

            <div className="pt-1">
              <Button onClick={handleLogin} disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Feature({ icon, text }) {
  return (
    <li className="flex items-start gap-3.5 text-[14px] text-green-100/80">
      <span className="mt-0.5 shrink-0 text-green-300">{icon}</span>
      <span className="leading-5">{text}</span>
    </li>
  );
}

export default Login;
