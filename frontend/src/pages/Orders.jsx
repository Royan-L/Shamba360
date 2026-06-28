import { FaCalendarDay, FaCheck, FaClipboardList, FaTruckLoading } from "react-icons/fa";
import AppShell from "../components/AppShell";
import Button from "../components/Button";
import DataPanel from "../components/DataPanel";
import StatusBadge from "../components/StatusBadge";
import useDashboardData from "../hooks/useDashboardData";

const statusTone = {
  pending: "amber",
  confirmed: "blue",
  ready: "green",
  collected: "gray",
};

function Orders() {
  const { data, usingDemoData } = useDashboardData();
  const orders = data.orders || [];
  const pendingCount = orders.filter((order) => order.status === "pending").length;
  const readyCount = orders.filter((order) => order.status === "ready").length;
  const totalValue = orders.reduce((sum, order) => {
    const fallbackItem = data.inventory?.find(
      (item) => item.produce_type === order.inventory_item__produce_type
    );
    return sum + Number(order.value || Number(order.quantity) * Number(fallbackItem?.unit_price || 0));
  }, 0);

  return (
    <AppShell
      title="Orders"
      subtitle="Confirm buyer requests, prepare collections, and keep stock moving."
    >
      {usingDemoData && <DemoNotice />}

      <section className="grid gap-4 md:grid-cols-3">
        <QuickStat icon={<FaClipboardList />} label="Open orders" value={orders.length} />
        <QuickStat icon={<FaCalendarDay />} label="Need approval" value={pendingCount} />
        <QuickStat icon={<FaTruckLoading />} label="Ready today" value={readyCount} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <DataPanel
          title="Order Work Queue"
          icon={<FaClipboardList />}
          action={<Button className="min-h-9 w-auto px-3 py-1.5">Add order</Button>}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Buyer</th>
                  <th className="px-4 py-3 font-semibold">Produce</th>
                  <th className="px-4 py-3 font-semibold">Collection</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.reference_code}>
                    <td className="px-4 py-4 font-bold text-slate-950">{order.reference_code}</td>
                    <td className="px-4 py-4 text-slate-600">{order.customer__email}</td>
                    <td className="px-4 py-4 text-slate-600">
                      {order.quantity} {order.inventory_item__produce_type}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{order.collection_date}</td>
                    <td className="px-4 py-4">
                      <StatusBadge tone={statusTone[order.status] || "gray"}>{order.status}</StatusBadge>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-green-200 px-3 text-sm font-semibold text-green-800 hover:bg-green-50"
                      >
                        <FaCheck /> Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataPanel>

        <DataPanel title="Collection Plan" icon={<FaTruckLoading />}>
          <div className="space-y-3">
            {orders.slice(0, 4).map((order) => (
              <article key={order.reference_code} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950">{order.inventory_item__produce_type}</p>
                    <p className="mt-1 text-sm text-slate-500">{order.quantity} units for {order.customer__email}</p>
                  </div>
                  <StatusBadge tone={statusTone[order.status] || "gray"}>{order.status}</StatusBadge>
                </div>
                <p className="mt-3 text-xs font-semibold uppercase text-slate-500">
                  Collection {order.collection_date}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-green-50 p-4">
            <p className="text-sm font-bold text-green-950">Expected order value</p>
            <p className="mt-1 text-2xl font-bold text-green-800">KES {totalValue.toLocaleString()}</p>
          </div>
        </DataPanel>
      </section>
    </AppShell>
  );
}

function QuickStat({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-800">
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function DemoNotice() {
  return (
    <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
      Showing demo orders until the backend is connected.
    </div>
  );
}

export default Orders;
