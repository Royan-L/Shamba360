import {
  FaBoxes,
  FaChartLine,
  FaClipboardCheck,
  FaComments,
  FaExclamationTriangle,
  FaFileDownload,
  FaLeaf,
  FaLightbulb,
  FaUserClock,
} from "react-icons/fa";
import AppShell from "../components/AppShell";
import DataPanel from "../components/DataPanel";
import StatusBadge from "../components/StatusBadge";
import useAuth from "../hooks/useAuth";
import useDashboardData from "../hooks/useDashboardData";
import useMarketplaceData from "../hooks/useMarketplaceData";

function Dashboard() {
  const { currentUser } = useAuth();
  const { data, loading, usingDemoData } = useDashboardData();
  const { inventory, orders, feedback } = useMarketplaceData(data);

  const metrics = data?.metrics || {};
  const isManager = currentUser?.role === "manager";
  const urgentProduce = inventory.filter((item) => item.handling_priority === "Urgent" || item.perishability === "High");

  return (
    <AppShell
      title={`${currentUser?.farmName || "Farm"} operations`}
      subtitle="Monitor produce, orders, crop yield, sales, and operator activity."
    >
      {usingDemoData && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Showing demo farm data because the API is not reachable yet.
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<FaBoxes />} label="Produce items" value={inventory.length || metrics.inventoryItems || 0} helper="Tracked produce lines" />
        <Metric icon={<FaClipboardCheck />} label="Pending orders" value={orders.filter((order) => order.status === "pending").length || metrics.pendingOrders || 0} helper="Need manager action" />
        <Metric icon={<FaLeaf />} label="Crop yield" value={metrics.harvestQuantity || 0} helper="Total recorded units" />
        <Metric icon={<FaExclamationTriangle />} label="Urgent produce" value={urgentProduce.length} helper="Sell or dispatch first" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <DataPanel title="Produce Status" icon={<FaBoxes />}>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Produce</th>
                  <th className="px-4 py-3 font-semibold">Quantity</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventory.map((item) => {
                  const lowStock = Number(item.quantity) <= Number(item.low_stock_threshold);
                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-semibold text-gray-900">{item.produce_type}</td>
                      <td className="px-4 py-3 text-gray-600">{item.quantity} {item.unit}</td>
                      <td className="px-4 py-3 text-gray-600">KES {Number(item.unit_price).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={item.handling_priority === "Urgent" ? "red" : lowStock ? "amber" : "green"}>
                          {item.handling_priority === "Urgent" ? "Sell first" : lowStock ? "Low supply" : "Healthy"}
                        </StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {loading && <p className="mt-3 text-sm text-gray-500">Refreshing farm data...</p>}
        </DataPanel>

        <DataPanel title="Customer Orders" icon={<FaClipboardCheck />}>
          <div className="space-y-3">
            {orders.map((order) => (
              <Record
                key={order.reference_code}
                title={order.reference_code}
                detail={`${order.customer__email} requested ${order.quantity} ${order.inventory_item__produce_type}`}
                meta={order.collection_date}
                badge={<StatusBadge tone={order.status === "pending" ? "amber" : "green"}>{order.status}</StatusBadge>}
              />
            ))}
          </div>
        </DataPanel>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <DataPanel title="Operator Tips" icon={<FaLightbulb />}>
          <div className="space-y-3">
            {(data.operatorTips || []).map((tip) => (
              <Insight key={tip.title} title={tip.title} detail={tip.advice} meta={`${tip.crop} - ${tip.category}`} tone={tip.priority === "High" ? "red" : "amber"} />
            ))}
          </div>
        </DataPanel>

        <DataPanel title="Market Knowledge" icon={<FaChartLine />}>
          <div className="space-y-3">
            {(data.marketInsights || []).map((tip) => (
              <Insight key={tip.produce_type} title={`${tip.produce_type}: ${tip.demand} demand`} detail={tip.signal} meta={tip.action} tone={tip.demand === "High" ? "green" : "blue"} />
            ))}
          </div>
        </DataPanel>

        <DataPanel title="Customer Feedback" icon={<FaComments />}>
          <div className="space-y-3">
            {feedback.slice(0, 3).map((item) => (
              <Insight key={`${item.reference_code}-${item.comment}`} title={`${item.produce_type} - ${item.rating}/5`} detail={item.comment} meta={item.customer_name} tone="green" />
            ))}
          </div>
        </DataPanel>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <DataPanel title="Recent Yield" icon={<FaLeaf />}>
          <div className="space-y-3">
            {(data?.harvests || []).map((harvest) => (
              <Record
                key={`${harvest.produce_type}-${harvest.harvest_date}`}
                title={harvest.produce_type}
                detail={`${harvest.quantity} ${harvest.unit}`}
                meta={harvest.harvest_date}
              />
            ))}
          </div>
        </DataPanel>

        <DataPanel title="Sales Records" icon={<FaChartLine />}>
          <div className="space-y-3">
            {(data?.sales || []).map((sale) => (
              <Record
                key={`${sale.customer_name}-${sale.sale_date}`}
                title={sale.customer_name}
                detail={`${sale.quantity} ${sale.inventory_item__produce_type}`}
                meta={`KES ${Number(sale.unit_price).toLocaleString()}`}
              />
            ))}
          </div>
        </DataPanel>

        <DataPanel title="Reports" icon={<FaFileDownload />}>
          <div className="grid gap-3">
            <ReportButton label="Crop yield summary" disabled={!isManager} />
            <ReportButton label="Produce status" disabled={!isManager} />
            <ReportButton label="Sales performance" disabled={!isManager} />
          </div>
          {!isManager && (
            <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
              Report downloads are available to farm managers only.
            </p>
          )}
        </DataPanel>
      </section>

      <section className="mt-6">
        <DataPanel title="Operator Activity" icon={<FaUserClock />}>
          <div className="grid gap-3 md:grid-cols-2">
            {(data?.activity || []).map((item) => (
              <Record
                key={`${item.actor__email}-${item.action}`}
                title={item.actor__email}
                detail={item.action}
                meta={new Date(item.created_at).toLocaleDateString()}
              />
            ))}
          </div>
        </DataPanel>
      </section>
    </AppShell>
  );
}

function Metric({ icon, label, value, helper }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-950">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-800">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-xs text-gray-500">{helper}</p>
    </div>
  );
}

function Record({ title, detail, meta, badge }) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-4 rounded-lg border border-gray-200 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-950">{title}</p>
        <p className="mt-1 truncate text-sm text-gray-500">{detail}</p>
      </div>
      <div className="shrink-0 text-right">
        {badge || <p className="text-xs font-semibold text-gray-500">{meta}</p>}
        {badge && <p className="mt-1 text-xs text-gray-500">{meta}</p>}
      </div>
    </div>
  );
}

function Insight({ title, detail, meta, tone }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-bold text-slate-950">{title}</p>
        <StatusBadge tone={tone}>{meta?.split(" - ")[0]}</StatusBadge>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
      <p className="mt-3 text-xs font-semibold uppercase text-slate-400">{meta}</p>
    </article>
  );
}

function ReportButton({ label, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="flex h-11 items-center justify-between rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-700 transition hover:border-green-700 hover:text-green-800 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
    >
      {label}
      <FaFileDownload />
    </button>
  );
}

export default Dashboard;
