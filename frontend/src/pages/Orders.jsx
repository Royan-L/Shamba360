import { useState } from "react";
import { FaCalendarDay, FaCheck, FaClipboardList, FaTruckLoading } from "react-icons/fa";
import AppShell from "../components/AppShell";
import Button from "../components/Button";
import DataPanel from "../components/DataPanel";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import useDashboardData from "../hooks/useDashboardData";
import useAuth from "../hooks/useAuth";
import useMarketplaceData from "../hooks/useMarketplaceData";

const statusTone = {
  pending: "amber",
  approved: "green",
  ready: "blue",
  confirmed: "blue",
  collected: "gray",
};

function Orders() {
  const { currentUser } = useAuth();
  const { data, usingDemoData } = useDashboardData();
  const { orders, inventory, updateOrderStatus } = useMarketplaceData(data);
  const readyCount = orders.filter((order) => ["ready", "approved"].includes(order.status)).length;
  const [notice, setNotice] = useState("");
  const [orderActionFeedback, setOrderActionFeedback] = useState({});
  const pendingCount = orders.filter((order) => order.status === "pending").length;
  const totalValue = orders.reduce((sum, order) => {
    const fallbackItem = inventory.find(
      (item) => item.produce_type === order.inventory_item__produce_type
    );
    return sum + Number(order.value || Number(order.quantity) * Number(fallbackItem?.unit_price || 0));
  }, 0);

  const approveOrder = async (order) => {
    try {
      const response = await api.post(`/orders/${order.reference_code}/approve/`, {
        approverEmail: currentUser?.email,
      });
      updateOrderStatus({
        referenceCode: order.reference_code,
        status: "ready",
        trackingStep: "Approved and ready for pickup",
      });

      const email = response.data?.email;
      if (email?.sent) {
        setNotice(`Order ${order.reference_code} is ready for pickup. Email receipt sent to buyer.`);
        setOrderActionFeedback((previous) => ({
          ...previous,
          [order.reference_code]: "Ready for pickup. Email receipt sent to buyer.",
        }));
      } else {
        const reason = email?.reason || "unknown error.";
        setNotice(`Order ${order.reference_code} is ready for pickup. Email not sent: ${reason}`);
        setOrderActionFeedback((previous) => ({
          ...previous,
          [order.reference_code]: `Ready for pickup, but email failed: ${reason}`,
        }));
      }
    } catch (error) {
      const reason = error.response?.data?.detail || `Failed to approve ${order.reference_code}.`;
      setNotice(reason);
      setOrderActionFeedback((previous) => ({
        ...previous,
        [order.reference_code]: reason,
      }));
    }
  };

  const dispatchOrder = async (order) => {
    try {
      await api.post(`/orders/${order.reference_code}/dispatch/`, {
        approverEmail: currentUser?.email,
        confirmCollected: true,
      });

      updateOrderStatus({
        referenceCode: order.reference_code,
        status: "collected",
        trackingStep: "Dispatched for pickup",
      });

      setNotice(`Order ${order.reference_code} dispatched successfully.`);
      setOrderActionFeedback((previous) => ({
        ...previous,
        [order.reference_code]: "Order dispatched and marked as collected.",
      }));
    } catch (error) {
      const reason = error.response?.data?.detail || `Failed to dispatch ${order.reference_code}.`;
      setNotice(reason);
      setOrderActionFeedback((previous) => ({
        ...previous,
        [order.reference_code]: reason,
      }));
    }
  };

  return (
    <AppShell
      title="Orders"
      subtitle="Confirm buyer requests, prepare collections, and keep produce moving."
    >
      {usingDemoData && <DemoNotice />}

      {notice && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-900">
          {notice}
        </div>
      )}

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
                      {order.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => approveOrder(order)}
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-green-200 px-3 text-sm font-semibold text-green-800 hover:bg-green-50"
                        >
                          <FaCheck /> Approve
                        </button>
                      ) : ["approved", "ready"].includes(order.status) ? (
                        <button
                          type="button"
                          onClick={() => dispatchOrder(order)}
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-violet-200 px-3 text-sm font-semibold text-violet-800 hover:bg-violet-50"
                        >
                          <FaTruckLoading /> Mark collected
                        </button>
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">No action</span>
                      )}
                      {orderActionFeedback[order.reference_code] && (
                        <p className="mt-2 max-w-[240px] text-xs font-medium text-slate-500">
                          {orderActionFeedback[order.reference_code]}
                        </p>
                      )}
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
