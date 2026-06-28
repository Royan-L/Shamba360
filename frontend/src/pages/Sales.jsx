import { useEffect, useState } from "react";
import { FaChartLine, FaFileDownload, FaMoneyBillWave, FaReceipt } from "react-icons/fa";
import AppShell from "../components/AppShell";
import Button from "../components/Button";
import DataPanel from "../components/DataPanel";
import StatusBadge from "../components/StatusBadge";
import useDashboardData from "../hooks/useDashboardData";

function Sales() {
  const { data, usingDemoData } = useDashboardData();
  const [sales, setSales] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setSales(data.sales || []);
  }, [data.sales]);

  const revenue = sales.reduce(
    (sum, sale) => sum + Number(sale.quantity || 0) * Number(sale.unit_price || 0),
    0
  );

  const recordSale = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const sale = {
      customer_name: form.get("customer_name"),
      inventory_item__produce_type: form.get("produce"),
      quantity: Number(form.get("quantity")),
      unit_price: Number(form.get("unit_price")),
      sale_date: new Date().toISOString().slice(0, 10),
      payment_status: form.get("payment_status"),
    };

    setSales((current) => [sale, ...current]);
    setShowForm(false);
    setNotice(`Sale to ${sale.customer_name} was recorded.`);
  };

  const downloadReport = (reportName) => {
    const rows = [
      ["Date", "Customer", "Produce", "Quantity", "Unit price", "Value", "Payment"],
      ...sales.map((sale) => [
        sale.sale_date,
        sale.customer_name,
        sale.inventory_item__produce_type,
        sale.quantity,
        sale.unit_price,
        Number(sale.quantity || 0) * Number(sale.unit_price || 0),
        sale.payment_status || "Pending",
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportName.toLowerCase().replaceAll(" ", "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice(`${reportName} report downloaded.`);
  };

  return (
    <AppShell
      title="Sales Activity"
      subtitle="Track completed sales, payment status, and customer buying patterns."
    >
      {usingDemoData && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Showing demo sales until the backend is connected.
        </div>
      )}

      {notice && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-900">
          {notice}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <SalesStat icon={<FaReceipt />} label="Transactions" value={sales.length} />
        <SalesStat icon={<FaMoneyBillWave />} label="Revenue" value={`KES ${revenue.toLocaleString()}`} />
        <SalesStat icon={<FaChartLine />} label="Average sale" value={`KES ${Math.round(revenue / Math.max(sales.length, 1)).toLocaleString()}`} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <DataPanel
          title="Sales Ledger"
          icon={<FaReceipt />}
          action={
            <Button className="min-h-9 w-auto px-3 py-1.5" onClick={() => setShowForm((value) => !value)}>
              {showForm ? "Close" : "Record sale"}
            </Button>
          }
        >
          {showForm && (
            <form onSubmit={recordSale} className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Field name="customer_name" label="Customer" defaultValue="Local buyer" />
                <Field name="produce" label="Produce" defaultValue="Tomatoes" />
                <Field name="quantity" label="Quantity" type="number" defaultValue="20" />
                <Field name="unit_price" label="Unit price" type="number" defaultValue="95" />
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Payment</span>
                  <select
                    name="payment_status"
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
                  >
                    <option>Paid</option>
                    <option>Part paid</option>
                    <option>Pending</option>
                  </select>
                </label>
              </div>
              <div className="mt-4 flex justify-end">
                <Button className="w-auto px-4" type="submit">Save sale</Button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Produce</th>
                  <th className="px-4 py-3 font-semibold">Quantity</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => {
                  const value = Number(sale.quantity || 0) * Number(sale.unit_price || 0);
                  const paid = sale.payment_status === "Paid";
                  return (
                    <tr key={`${sale.customer_name}-${sale.sale_date}-${sale.inventory_item__produce_type}`}>
                      <td className="px-4 py-4 font-semibold text-slate-950">{sale.sale_date}</td>
                      <td className="px-4 py-4 text-slate-600">{sale.customer_name}</td>
                      <td className="px-4 py-4 text-slate-600">{sale.inventory_item__produce_type}</td>
                      <td className="px-4 py-4 text-slate-600">{sale.quantity}</td>
                      <td className="px-4 py-4 font-semibold text-slate-950">KES {value.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <StatusBadge tone={paid ? "green" : "amber"}>{sale.payment_status || "Pending"}</StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DataPanel>

        <DataPanel
          title="Reports"
          icon={<FaFileDownload />}
          action={
            <Button variant="secondary" className="min-h-9 w-auto px-3 py-1.5" onClick={() => downloadReport("Sales ledger")}>
              Export
            </Button>
          }
        >
          <div className="space-y-3">
            {["Daily sales", "Customer balances", "Crop performance"].map((report) => (
              <button
                key={report}
                type="button"
                onClick={() => downloadReport(report)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:border-green-700 hover:text-green-800"
              >
                {report}
                <FaFileDownload />
              </button>
            ))}
          </div>
        </DataPanel>
      </section>
    </AppShell>
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

function SalesStat({ icon, label, value }) {
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

export default Sales;
