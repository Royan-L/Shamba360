import { NavLink, useNavigate } from "react-router-dom";
import { FaBoxes, FaChartLine, FaClipboardList, FaLeaf, FaSignOutAlt, FaStore, FaUserClock } from "react-icons/fa";
import Logo from "./Logo";
import useAuth from "../hooks/useAuth";

const staffNav = [
  { label: "Overview", to: "/dashboard", icon: <FaChartLine /> },
  { label: "Inventory", to: "/dashboard", icon: <FaBoxes /> },
  { label: "Harvests", to: "/dashboard", icon: <FaLeaf /> },
  { label: "Orders", to: "/dashboard", icon: <FaClipboardList /> },
  { label: "Activity", to: "/dashboard", icon: <FaUserClock /> },
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
    navigate(portal === "customer" ? "/customer-login" : "/staff-login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white px-4 py-5 lg:block">
        <Logo />
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-green-50 text-green-800" : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-green-700">
                {currentUser?.role || portal}
              </p>
              <h1 className="truncate text-xl font-bold text-gray-950 sm:text-2xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-gray-900">{currentUser?.fullName}</p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 hover:border-green-700 hover:text-green-800"
              >
                <FaSignOutAlt /> Log out
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export default AppShell;

