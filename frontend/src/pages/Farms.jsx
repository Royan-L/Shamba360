import { useState } from "react";
import { FaChartLine, FaMapMarkerAlt, FaPlus, FaSeedling, FaTractor } from "react-icons/fa";
import AppShell from "../components/AppShell";
import Button from "../components/Button";
import DataPanel from "../components/DataPanel";
import StatusBadge from "../components/StatusBadge";
import useDashboardData from "../hooks/useDashboardData";
import useMarketplaceData from "../hooks/useMarketplaceData";

const healthTone = {
  Excellent: "green",
  Good: "green",
  Watch: "amber",
  Critical: "red",
};

function Farms() {
  const { data, usingDemoData } = useDashboardData();
  const { farms, addFarm } = useMarketplaceData(data);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");

  const saveFarm = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const farm = addFarm({
      name: form.get("name"),
      manager: form.get("manager"),
      county: form.get("county"),
      area: form.get("area"),
      distance_km: form.get("distance_km"),
      health_status: form.get("health_status"),
      produce_ready_days: form.get("produce_ready_days"),
      produce: form.get("produce"),
      soil_focus: form.get("soil_focus"),
      market_tip: form.get("market_tip"),
    });

    setShowForm(false);
    setNotice(`${farm.name} was added to the farm network.`);
    event.currentTarget.reset();
  };

  return (
    <AppShell
      title="Farms"
      subtitle="Manage farm locations, readiness, health status, and produce availability."
    >
      {usingDemoData && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Showing demo farm network data until the backend is connected.
        </div>
      )}

      {notice && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-900">
          {notice}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <FarmStat icon={<FaTractor />} label="Managed farms" value={farms.length} />
        <FarmStat icon={<FaSeedling />} label="Ready within 3 days" value={farms.filter((farm) => Number(farm.produce_ready_days) <= 3).length} />
        <FarmStat icon={<FaMapMarkerAlt />} label="Nearest farm" value={`${Math.min(...farms.map((farm) => Number(farm.distance_km || 0))).toLocaleString()} km`} />
      </section>

      <section className="mt-6 rounded-lg border border-green-200 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
          <FarmBrief icon={<FaSeedling />} title="Soil and fertilizer" text="Record the next soil action per farm so operators know whether to apply compost, CAN, potassium, or pest checks." />
          <FarmBrief icon={<FaChartLine />} title="Market awareness" text="Track which produce has demand before harvesting so durable crops can be held and perishables can move first." />
          <FarmBrief icon={<FaMapMarkerAlt />} title="Customer discovery" text="Location and distance help customers choose the nearest farm with available produce." />
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <DataPanel
          title="Add Farm"
          icon={<FaPlus />}
          action={
            <Button className="min-h-9 w-auto px-3 py-1.5" onClick={() => setShowForm((value) => !value)}>
              {showForm ? "Close" : "New farm"}
            </Button>
          }
        >
          {showForm ? (
            <form onSubmit={saveFarm} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field name="name" label="Farm name" defaultValue="Sunrise Acres" />
                <Field name="manager" label="Manager" defaultValue="Grace Mutua" />
                <Field name="county" label="County" defaultValue="Kiambu" />
                <Field name="area" label="Area" defaultValue="Limuru" />
                <Field name="distance_km" label="Distance km" type="number" defaultValue="11" />
                <Field name="produce_ready_days" label="Ready in days" type="number" defaultValue="3" />
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Health status</span>
                <select
                  name="health_status"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
                >
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Watch</option>
                  <option>Critical</option>
                </select>
              </label>
              <Field name="produce" label="Produce available" defaultValue="Potatoes, Onions, Dry beans" />
              <Field name="soil_focus" label="Operator soil / fertilizer tip" defaultValue="Top-dress potatoes with CAN and keep ridges covered." />
              <Field name="market_tip" label="Market knowledge" defaultValue="Onions and potatoes have strong demand from hotels this week." />
              <Button type="submit">Save farm</Button>
            </form>
          ) : (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">Farm manager workflow</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Add each farm with a clear location, expected readiness window, and health status so customers can discover nearby produce.
              </p>
            </div>
          )}
        </DataPanel>

        <DataPanel title="Farm Network" icon={<FaTractor />}>
          <div className="grid gap-4 md:grid-cols-2">
            {farms.map((farm) => (
              <article key={farm.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-950">{farm.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{farm.area}, {farm.county}</p>
                  </div>
                  <StatusBadge tone={healthTone[farm.health_status] || "gray"}>{farm.health_status}</StatusBadge>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                  <Mini label="Manager" value={farm.manager} />
                  <Mini label="Distance" value={`${farm.distance_km} km`} />
                  <Mini label="Ready" value={`${farm.produce_ready_days} days`} />
                  <Mini label="Produce" value={(farm.produce || []).join(", ")} />
                </div>
                <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-950">{farm.soil_focus || "Review soil and fertilizer schedule before planting."}</p>
                  <p className="text-sm leading-6 text-slate-600">{farm.market_tip || "Use current orders to guide harvest and selling priorities."}</p>
                </div>
              </article>
            ))}
          </div>
        </DataPanel>
      </section>
    </AppShell>
  );
}

function FarmBrief({ icon, title, text }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-700 text-white">{icon}</span>
      <div>
        <p className="font-bold text-slate-950">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", defaultValue }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required
        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
      />
    </label>
  );
}

function FarmStat({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-800">
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

export default Farms;
