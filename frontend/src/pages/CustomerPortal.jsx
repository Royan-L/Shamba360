import { useEffect, useState } from "react";
import { FaClipboardList, FaLeaf, FaShoppingBasket, FaStore } from "react-icons/fa";
import AppShell from "../components/AppShell";
import Button from "../components/Button";
import DataPanel from "../components/DataPanel";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

function CustomerPortal() {
  const [data, setData] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    api.get("/dashboard/").then((response) => setData(response.data));
  }, []);

  return (
    <AppShell
      portal="customer"
      title="Produce marketplace"
      subtitle={`Welcome back${currentUser?.fullName ? `, ${currentUser.fullName}` : ""}. Browse available stock and track orders.`}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard icon={<FaStore />} label="Available produce" value={data?.inventory?.length || 0} />
        <SummaryCard icon={<FaClipboardList />} label="Open orders" value={data?.orders?.length || 0} />
        <SummaryCard icon={<FaLeaf />} label="Farm source" value="Green Valley" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <DataPanel title="Available Produce" icon={<FaStore />}>
          <div className="grid gap-4 md:grid-cols-2">
            {(data?.inventory || []).map((item) => (
              <article key={item.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-950">{item.produce_type}</h2>
                    <p className="mt-1 text-sm text-gray-500">{item.quantity} {item.unit} available</p>
                  </div>
                  <StatusBadge tone={Number(item.quantity) <= Number(item.low_stock_threshold) ? "amber" : "green"}>
                    {Number(item.quantity) <= Number(item.low_stock_threshold) ? "Limited" : "Available"}
                  </StatusBadge>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <p className="text-sm font-semibold text-gray-900">
                    KES {Number(item.unit_price).toLocaleString()} / {item.unit}
                  </p>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-green-700 px-3 text-sm font-semibold text-white hover:bg-green-800"
                  >
                    <FaShoppingBasket /> Order
                  </button>
                </div>
              </article>
            ))}
          </div>
        </DataPanel>

        <DataPanel
          title="My Orders"
          icon={<FaClipboardList />}
          action={<Button className="min-h-9 w-auto px-3 py-1.5">New order</Button>}
        >
          <div className="space-y-3">
            {(data?.orders || []).map((order) => (
              <div key={order.reference_code} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-950">{order.reference_code}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {order.quantity} {order.inventory_item__produce_type}
                    </p>
                  </div>
                  <StatusBadge tone={order.status === "pending" ? "amber" : "green"}>{order.status}</StatusBadge>
                </div>
                <p className="mt-3 text-xs font-medium text-gray-500">
                  Collection: {order.collection_date}
                </p>
              </div>
            ))}
          </div>
        </DataPanel>
      </section>
    </AppShell>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-800">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-950">{value}</p>
    </div>
  );
}

export default CustomerPortal;
