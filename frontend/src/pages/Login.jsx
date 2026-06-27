import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaClipboardList, FaLock, FaSeedling, FaShoppingBasket, FaUserTie } from "react-icons/fa";

import Button from "../components/Button";
import Input from "../components/Input";
import Logo from "../components/Logo";
import PasswordInput from "../components/PasswordInput";
import StatusBadge from "../components/StatusBadge";
import useAuth from "../hooks/useAuth";

const DEMO_USERS = {
  staff: [
    { label: "Manager", email: "manager@shamba360.test", role: "Full access" },
    { label: "Operator", email: "operator@shamba360.test", role: "Daily entries" },
  ],
  customer: [{ label: "Customer", email: "customer@shamba360.test", role: "Orders" }],
};

function Login({ portal = "staff" }) {
  const isCustomerPortal = portal === "customer";
  const [email, setEmail] = useState(
    isCustomerPortal ? "customer@shamba360.test" : "manager@shamba360.test"
  );
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
      setError(err.response?.data?.detail || "That email or password doesn't match our records.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("Password123!");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">

      {/* ── Left: full-height green brand panel ── */}
      <aside className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between bg-green-900 px-14 py-14 text-white overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-green-700/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-[480px] w-[480px] rounded-full bg-green-950/60 blur-3xl" />
        <FaSeedling
          className="pointer-events-none absolute right-10 bottom-10 text-[260px] text-green-800/20"
          aria-hidden="true"
        />

        {/* Top: logo */}
        <div className="relative">
          <Logo tone="dark" />
        </div>

        {/* Middle: headline */}
        <div className="relative">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-green-400">
            {isCustomerPortal ? "Customer access" : "Farm staff access"}
          </p>
          <h1 className="max-w-md text-[2.6rem] font-bold leading-[1.15] tracking-tight">
            {isCustomerPortal
              ? "Order produce.\nSee exactly where it stands."
              : "Every harvest, sale, and order — one workspace."}
          </h1>
          <p className="mt-5 max-w-sm text-[15px] leading-7 text-green-200/75">
            {isCustomerPortal
              ? "Browse what's in stock right now and track every order from request to collection."
              : "Managers approve orders and pull reports. Operators log the day's work. Nothing gets written on paper."}
          </p>

          <ul className="mt-10 space-y-4">
            <Feature icon={<FaClipboardList />} text="Built around how the farm actually works, day to day" />
            <Feature icon={<FaLock />} text="Staff and customers each see only what's theirs" />
            <Feature icon={<FaShoppingBasket />} text="Stock and order status update in real time" />
          </ul>
        </div>

        {/* Bottom: subtle tagline */}
        <p className="relative text-xs text-green-500/60 tracking-wide">
          Shamba360 · Smart Farm Management
        </p>
      </aside>

      {/* ── Right: full-height form side with blurred background ── */}
      <main className="flex flex-1 flex-col items-center justify-center relative overflow-y-auto">
        {/* Blurred background blobs sitting behind everything */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-green-200/60 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-emerald-100/70 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-green-50/80 blur-2xl" />
        </div>

        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>

        {/* Glassmorphism card */}
        <div
          className="w-full max-w-md mx-6 rounded-3xl px-8 py-10 sm:px-10"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 8px 40px 0 rgba(30,80,40,0.10), 0 1.5px 0 0 rgba(255,255,255,0.7) inset",
            border: "1px solid rgba(255,255,255,0.55)",
          }}
        >
          {/* Portal switcher */}
          <div className="mb-8 grid grid-cols-2 gap-1 rounded-xl bg-stone-100/80 p-1">
            <PortalTab active={!isCustomerPortal} to="/staff-login" icon={<FaUserTie />} label="Staff" />
            <PortalTab active={isCustomerPortal} to="/customer-login" icon={<FaShoppingBasket />} label="Customer" />
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-[1.75rem] font-bold tracking-tight text-stone-950">
              Welcome back
            </h2>
            <p className="mt-1.5 text-[14px] text-stone-500">
              {isCustomerPortal
                ? "Sign in to your customer account."
                : "Sign in to continue to Shamba360."}
            </p>
          </div>

          {/* Fields */}
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
                className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </p>
            )}

            <div className="pt-1">
              <Button onClick={handleLogin} disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </div>
          </div>

          {/* Demo profiles */}
          <div className="mt-8 border-t border-stone-200/60 pt-6">
            <div className="mb-3.5 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
                Try a demo profile
              </p>
              <span className="rounded-md bg-stone-100 px-2 py-0.5 font-mono text-[11px] text-stone-500">
                Password123!
              </span>
            </div>
            <div className="space-y-2.5">
              {DEMO_USERS[portal].map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => fillDemoUser(user.email)}
                  className="group flex w-full items-center justify-between gap-3 rounded-xl border border-stone-200/70 bg-white/50 px-4 py-3.5 text-left text-sm transition-all duration-150 hover:border-green-500 hover:bg-green-50/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
                >
                  <span>
                    <span className="block font-semibold text-stone-900 group-hover:text-green-900">
                      {user.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-stone-400">{user.email}</span>
                  </span>
                  <StatusBadge tone={user.label === "Manager" ? "green" : "gray"}>
                    {user.role}
                  </StatusBadge>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PortalTab({ active, to, icon, label }) {
  return (
    <Link
      to={to}
      className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 ${
        active
          ? "bg-white text-green-800 shadow-sm ring-1 ring-stone-200/60"
          : "text-stone-500 hover:text-stone-700"
      }`}
    >
      <span className={active ? "text-green-700" : "text-stone-400"}>{icon}</span>
      {label}
    </Link>
  );
}

function Feature({ icon, text }) {
  return (
    <li className="flex items-start gap-3.5 text-[14px] text-green-100/80">
      <span className="mt-0.5 shrink-0 text-green-400">{icon}</span>
      <span className="leading-5">{text}</span>
    </li>
  );
}

export default Login;
