import { useEffect, useState } from "react";
import { FaBoxes, FaExclamationTriangle, FaPlus, FaWarehouse } from "react-icons/fa";
import AppShell from "../components/AppShell";
import Button from "../components/Button";
import DataPanel from "../components/DataPanel";
import StatusBadge from "../components/StatusBadge";
import useDashboardData from "../hooks/useDashboardData";

function Inventory() {
  const { data, usingDemoData } = useDashboardData();
  const [inventory, setInventory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setInventory(data.inventory || []);
  }, [data.inventory]);

  const lowStockItems = inventory.filter(
    (item) => Number(item.quantity) <= Number(item.low_stock_threshold)
  );
  const stockValue = inventory.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
    0
  );

  const addStock = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const item = {
      id: Date.now(),
      produce_type: form.get("produce_type"),
      grade: form.get("grade") || "Standard",
      location: form.get("location") || "Store",
      unit: form.get("unit"),
      quantity: Number(form.get("quantity")),
      unit_price: Number(form.get("unit_price")),
      low_stock_threshold: Number(form.get("low_stock_threshold")),
    };

    setInventory((current) => [item, ...current]);
    setShowForm(false);
    setNotice(`${item.produce_type} was added to this stock register.`);
  };

  return (
    <AppShell
      title="Inventory"
      subtitle="See what is available, what needs harvesting, and where stock is stored."
    >
      {usingDemoData && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Showing demo stock until the backend is connected.
        </div>
      )}

      {notice && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-900">
          {notice}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <InventoryStat icon={<FaBoxes />} label="Produce lines" value={inventory.length} />
        <InventoryStat icon={<FaExclamationTriangle />} label="Low stock" value={lowStockItems.length} />
        <InventoryStat icon={<FaWarehouse />} label="Stock value" value={`KES ${stockValue.toLocaleString()}`} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <DataPanel
          title="Stock Register"
          icon={<FaBoxes />}
          action={
            <Button className="min-h-9 w-auto px-3 py-1.5" onClick={() => setShowForm((value) => !value)}>
              <FaPlus /> {showForm ? "Close" : "Add stock"}
            </Button>
          }
        >
          {showForm && (
            <form onSubmit={addStock} className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Field name="produce_type" label="Produce" defaultValue="Spinach" required />
                <Field name="quantity" label="Quantity" type="number" defaultValue="50" required />
                <Field name="unit" label="Unit" defaultValue="kg" required />
                <Field name="unit_price" label="Price" type="number" defaultValue="80" required />
                <Field name="low_stock_threshold" label="Low stock at" type="number" defaultValue="15" required />
                <Field name="location" label="Storage" defaultValue="Store" />
                <Field name="grade" label="Grade" defaultValue="Grade A" />
              </div>
              <div className="mt-4 flex justify-end">
                <Button className="w-auto px-4" type="submit">Save stock</Button>
              </div>
            </form>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {inventory.map((item) => {
              const lowStock = Number(item.quantity) <= Number(item.low_stock_threshold);
              return (
                <article key={item.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-950">{item.produce_type}</h2>
                      <p className="mt-1 text-sm text-slate-500">{item.grade || "Standard"} - {item.location || "Store"}</p>
                    </div>
                    <StatusBadge tone={lowStock ? "amber" : "green"}>
                      {lowStock ? "Reorder" : "Healthy"}
                    </StatusBadge>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                    <Mini label="Available" value={`${item.quantity} ${item.unit}`} />
                    <Mini label="Price" value={`KES ${Number(item.unit_price).toLocaleString()}`} />
                  </div>
                </article>
              );
            })}
          </div>
        </DataPanel>

        <DataPanel title="Attention Needed" icon={<FaExclamationTriangle />}>
          <div className="space-y-3">
            {(lowStockItems.length ? lowStockItems : inventory.slice(0, 2)).map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 p-4">
                <p className="font-bold text-slate-950">{item.produce_type}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {item.quantity} {item.unit} available. Threshold is {item.low_stock_threshold} {item.unit}.
                </p>
                <button className="mt-3 text-sm font-bold text-green-800" type="button">
                  Plan next harvest
                </button>
              </article>
            ))}
          </div>
        </DataPanel>
      </section>
    </AppShell>
  );
}

function Field({ label, name, type = "text", defaultValue, required = false }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
      />
    </label>
  );
}

function InventoryStat({ icon, label, value }) {
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
    <div>
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

export default Inventory;
