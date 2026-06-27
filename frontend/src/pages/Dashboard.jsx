import { useEffect, useState } from "react";
import {
  FaBoxes,
  FaChartLine,
  FaClipboardCheck,
  FaFileDownload,
  FaLeaf,
  FaSignOutAlt,
  FaUserClock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

function Dashboard() {
  const [data, setData] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/dashboard/").then((response) => setData(response.data));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/staff-login");
  };

  const metrics = data?.metrics || {};

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              {currentUser?.role === "manager" ? "Farm Manager" : "Farm Operator"}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentUser?.farmName || "Shamba360"} Operations
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-green-600 hover:text-green-700"
          >
            <FaSignOutAlt /> Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="grid gap-4 md:grid-cols-4">
          <Metric icon={<FaBoxes />} label="Inventory items" value={metrics.inventoryItems || 0} />
          <Metric icon={<FaClipboardCheck />} label="Pending orders" value={metrics.pendingOrders || 0} />
          <Metric icon={<FaLeaf />} label="Harvest quantity" value={metrics.harvestQuantity || 0} />
          <Metric icon={<FaChartLine />} label="Sales records" value={metrics.salesTransactions || 0} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <Panel title="Inventory Status" icon={<FaBoxes />}>
            {(data?.inventory || []).map((item) => (
              <Row
                key={item.id}
                title={item.produce_type}
                detail={`${item.quantity} ${item.unit} available`}
                meta={`KES ${Number(item.unit_price).toLocaleString()}`}
              />
            ))}
          </Panel>

          <Panel title="Recent Harvests" icon={<FaLeaf />}>
            {(data?.harvests || []).map((harvest) => (
              <Row
                key={`${harvest.produce_type}-${harvest.harvest_date}`}
                title={harvest.produce_type}
                detail={`${harvest.quantity} ${harvest.unit}`}
                meta={harvest.harvest_date}
              />
            ))}
          </Panel>

          <Panel title="Customer Orders" icon={<FaClipboardCheck />}>
            {(data?.orders || []).map((order) => (
              <Row
                key={order.reference_code}
                title={order.reference_code}
                detail={`${order.quantity} ${order.inventory_item__produce_type}`}
                meta={order.status}
              />
            ))}
          </Panel>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title="Sales Records" icon={<FaChartLine />}>
            {(data?.sales || []).map((sale) => (
              <Row
                key={`${sale.customer_name}-${sale.sale_date}`}
                title={sale.customer_name}
                detail={`${sale.quantity} ${sale.inventory_item__produce_type}`}
                meta={`KES ${Number(sale.unit_price).toLocaleString()}`}
              />
            ))}
          </Panel>

          <Panel title="Manager Tools" icon={<FaFileDownload />}>
            <div className="grid gap-3 md:grid-cols-3">
              <ToolButton label="Harvest report" disabled={currentUser?.role !== "manager"} />
              <ToolButton label="Inventory report" disabled={currentUser?.role !== "manager"} />
              <ToolButton label="Sales report" disabled={currentUser?.role !== "manager"} />
            </div>
            {currentUser?.role !== "manager" && (
              <p className="mt-3 text-sm text-gray-500">
                Report downloads are reserved for farm managers.
              </p>
            )}
          </Panel>
        </section>

        <section className="mt-6">
          <Panel title="Operator Activity" icon={<FaUserClock />}>
            {(data?.activity || []).map((item) => (
              <Row
                key={`${item.actor__email}-${item.action}`}
                title={item.actor__email}
                detail={item.action}
                meta={new Date(item.created_at).toLocaleDateString()}
              />
            ))}
          </Panel>
        </section>
      </main>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <div className="mb-3 text-green-700">{icon}</div>
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Panel({ title, icon, children }) {
  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <span className="text-green-700">{icon}</span>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Row({ title, detail, meta }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4">
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{detail}</p>
      </div>
      <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
        {meta}
      </span>
    </div>
  );
}

function ToolButton({ label, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="rounded-lg border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-700 hover:border-green-600 hover:text-green-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
    >
      {label}
    </button>
  );
}

export default Dashboard;
