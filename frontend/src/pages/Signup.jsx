import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaLeaf, FaUserPlus } from "react-icons/fa";

import Button from "../components/Button";
import Input from "../components/Input";
import Logo from "../components/Logo";
import PasswordInput from "../components/PasswordInput";
import useAuth from "../hooks/useAuth";

const ROLES = [
  { value: "manager", label: "Manager" },
  { value: "operator", label: "Operator" },
  { value: "customer", label: "Customer" },
];

function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async () => {
    setError("");

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await signup({
        fullName,
        email,
        password,
        role,
      });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create account. Please try again.");
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
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-green-300">Create account</p>
          <h1 className="max-w-lg whitespace-pre-line text-[2.6rem] font-bold leading-[1.15] tracking-tight">
            {"Choose your role and get started with Shamba360."}
          </h1>
          <p className="mt-5 max-w-sm text-[15px] leading-7 text-green-100/75">
            Register as a manager, operator, or customer. After signup, you can sign in and continue in your workspace.
          </p>
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
            <h2 className="text-[1.75rem] font-bold tracking-tight text-stone-950">Create your account</h2>
            <p className="mt-1.5 text-[14px] text-stone-500">Select your role and register to continue.</p>
            <p className="mt-2 text-sm text-stone-600">
              Already registered?{" "}
              <Link to="/login" className="font-semibold text-green-800 hover:text-green-900">
                Sign in
              </Link>
            </p>
          </div>

          <div className="space-y-3">
            <Input
              label="Full name"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Role</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaUserPlus />
                </span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                >
                  {ROLES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <PasswordInput
              label="Password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordInput
              label="Confirm password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              <Button onClick={handleSignup} disabled={loading}>
                {loading ? "Creating account..." : "Sign up"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Signup;
