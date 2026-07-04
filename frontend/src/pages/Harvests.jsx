import { useEffect, useState } from "react";
import { FaClipboardCheck, FaLeaf, FaPlus, FaSeedling, FaWarehouse } from "react-icons/fa";
import AppShell from "../components/AppShell";
import Button from "../components/Button";
import DataPanel from "../components/DataPanel";
import StatusBadge from "../components/StatusBadge";
import useDashboardData from "../hooks/useDashboardData";

function Harvests() {
  const { data, usingDemoData } = useDashboardData();
  const [harvests, setHarvests] = useState([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setHarvests(data.harvests || []);
  }, [data.harvests]);

  const totalQuantity = harvests.reduce((sum, harvest) => sum + Number(harvest.quantity || 0), 0);
  const latestHarvest = harvests[0];

  const saveHarvest = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const harvest = {
      produce_type: form.get("produce_type"),
      plot: form.get("plot"),
      quantity: Number(form.get("quantity")),
      unit: form.get("unit"),
      quality: form.get("quality"),
      handler: "Current operator",
      harvest_date: new Date().toISOString().slice(0, 10),
    };

    setHarvests((current) => [harvest, ...current]);
    setNotice(`${harvest.quantity} ${harvest.unit} of ${harvest.produce_type} was recorded.`);
    event.currentTarget.reset();
  };

  return (
    <AppShell
      title="Crop Yield"
      subtitle="Record what came from each plot, grade it, and move it into available produce."
    >
      {usingDemoData && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Showing demo crop yield records until the backend is connected.
        </div>
      )}

      {notice && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-900">
          {notice}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <HarvestStat icon={<FaLeaf />} label="Yield records" value={harvests.length} />
        <HarvestStat icon={<FaWarehouse />} label="Total quantity" value={totalQuantity.toLocaleString()} />
        <HarvestStat icon={<FaSeedling />} label="Latest crop" value={latestHarvest?.produce_type || "None"} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <DataPanel
          title="New Yield Record"
          icon={<FaPlus />}
        >
          <form onSubmit={saveHarvest}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="produce_type" label="Crop" value="Tomatoes" />
              <Field name="plot" label="Plot" value="Greenhouse 2" />
              <Field name="quantity" label="Quantity" type="number" value="180" />
              <Field name="unit" label="Unit" value="kg" />
              <Field name="quality" label="Grade" value="Grade A" />
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">Suggested next step</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Move graded produce into the produce register, then reserve quantities for confirmed orders.
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <Button className="w-auto px-4" type="submit">Record yield</Button>
            </div>
          </form>
        </DataPanel>

        <DataPanel title="Yield Log" icon={<FaClipboardCheck />}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Produce</th>
                  <th className="px-4 py-3 font-semibold">Plot</th>
                  <th className="px-4 py-3 font-semibold">Quantity</th>
                  <th className="px-4 py-3 font-semibold">Quality</th>
                  <th className="px-4 py-3 font-semibold">Handler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {harvests.map((harvest) => (
                  <tr key={`${harvest.produce_type}-${harvest.harvest_date}-${harvest.quantity}`}>
                    <td className="px-4 py-4 font-semibold text-slate-950">{harvest.harvest_date}</td>
                    <td className="px-4 py-4 text-slate-600">{harvest.produce_type}</td>
                    <td className="px-4 py-4 text-slate-600">{harvest.plot || "Main field"}</td>
                    <td className="px-4 py-4 text-slate-600">
                      {harvest.quantity} {harvest.unit}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge tone="green">{harvest.quality || "Checked"}</StatusBadge>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{harvest.handler || "Operator"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataPanel>
      </section>
    </AppShell>
  );
}

function HarvestStat({ icon, label, value }) {
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

function Field({ label, name, value, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        required
        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
        defaultValue={value}
      />
    </label>
  );
}

export default Harvests;
