import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBoxes,
  FaChartLine,
  FaClipboardList,
  FaLeaf,
  FaSignOutAlt,
  FaStore,
  FaTractor,
  FaUserClock,
} from "react-icons/fa";
import Logo from "./Logo";
import useAuth from "../hooks/useAuth";

const staffNav = [
  { label: "Overview", to: "/dashboard", icon: <FaChartLine /> },
  { label: "Produce", to: "/inventory", icon: <FaBoxes /> },
  { label: "Crop Yield", to: "/harvests", icon: <FaLeaf /> },
  { label: "Farms", to: "/farms", icon: <FaTractor /> },
  { label: "Orders", to: "/orders", icon: <FaClipboardList /> },
  { label: "Sales", to: "/sales", icon: <FaUserClock /> },
];


const customerNav = [
  { label: "Marketplace", to: "/customer", icon: <FaStore /> },
  { label: "Orders", to: "/customer", icon: <FaClipboardList /> },
];

function AppShell({ children, title, subtitle, portal = "staff" }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = portal === "customer" ? customerNav : staffNav;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f7faf5_0%,#eef7ec_42%,#f8fbf8_100%)] lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen min-h-0 flex-col overflow-y-auto border-r border-white/70 bg-slate-950 px-5 py-5 text-white shadow-[18px_0_45px_rgba(15,23,42,0.12)] lg:flex">
        <div className="rounded-lg bg-white/95 p-3 ring-1 ring-white/20">
          <Logo />
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-white/8 p-4">
          <p className="text-xs font-semibold uppercase text-green-200">Workspace</p>
          <p className="mt-1 truncate text-sm font-bold text-white">
            {currentUser?.farmName || "Green Valley Farm"}
          </p>
          <p className="mt-1 text-xs text-slate-300">{currentUser?.role || portal}</p>
        </div>

        <nav className="mt-6 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-semibold transition ${
                  isActive ? "bg-green-500 text-slate-950 shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/12 text-base">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-lg border border-green-300/20 bg-green-400/10 p-4">
          <p className="text-sm font-bold text-green-100">Today on the farm</p>
          <p className="mt-1 text-xs leading-5 text-green-50/80">
            Clear urgent perishables, confirm paid orders, then update produce availability.
          </p>
        </div>
      </aside>

      <div className="min-w-0 pb-20 lg:pb-0">
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
                aria-label="Main navigation"
              >
                <FaBars />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                  {currentUser?.role || portal}
                </p>
                <h1 className="truncate text-xl font-bold text-slate-950 sm:text-3xl">{title}</h1>
                {subtitle && <p className="mt-1 hidden text-sm text-slate-500 sm:block">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">{currentUser?.fullName || "Demo farmer"}</p>
                <p className="text-xs text-slate-500">{currentUser?.email || "farm workspace"}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-green-700 hover:text-green-800"
              >
                <FaSignOutAlt /> <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white px-2 py-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] lg:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-semibold ${
                isActive ? "bg-green-50 text-green-800" : "text-slate-500"
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default AppShell;
