import { useMemo, useState } from "react";
import { FaClipboardCheck, FaClipboardList, FaFire, FaMapMarkerAlt, FaRegStar, FaShoppingBasket, FaStore } from "react-icons/fa";
import AppShell from "../components/AppShell";
import Button from "../components/Button";
import DataPanel from "../components/DataPanel";
import StatusBadge from "../components/StatusBadge";
import useAuth from "../hooks/useAuth";
import useDashboardData from "../hooks/useDashboardData";
import useMarketplaceData from "../hooks/useMarketplaceData";
import api from "../services/api";

const statusTone = {
  pending: "amber",
  approved: "green",
  confirmed: "blue",
  ready: "green",
  collected: "gray",
};

const healthTone = {
  Excellent: "green",
  Good: "green",
  Watch: "amber",
  Critical: "red",
};

function CustomerPortal({ section = "marketplace" }) {
  const { currentUser, updateCurrentUser } = useAuth();
  const { data, usingDemoData } = useDashboardData();
  const { farms, inventory, feedback, placeOrder, addFeedback, customerOrders } = useMarketplaceData(data);
  const [selectedItem, setSelectedItem] = useState(null);
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [notice, setNotice] = useState("");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [smsOptIn, setSmsOptIn] = useState(Boolean(currentUser?.smsOptIn));
  const [savingNotifications, setSavingNotifications] = useState(false);

  const myOrders = customerOrders(currentUser?.email || "customer@shamba360.test");
  const isOrdersSection = section === "orders";
  const nearbyFarms = useMemo(
    () => [...farms].sort((a, b) => Number(a.distance_km) - Number(b.distance_km)),
    [farms]
  );

  const submitOrder = async (event) => {
    event.preventDefault();
    if (!selectedItem) return;

    const form = new FormData(event.currentTarget);
    try {
      const order = await placeOrder({
        item: selectedItem,
        quantity: form.get("quantity"),
        collectionDate: form.get("collection_date"),
        customerEmail: currentUser?.email || "customer@shamba360.test",
      });

      setNotice(`${order.reference_code} was placed for ${order.quantity} ${selectedItem.unit} of ${selectedItem.produce_type}.`);
      setSelectedItem(null);
    } catch (error) {
      setNotice(error.response?.data?.detail || "Could not place order. Please try again.");
    }
  };

  const submitFeedback = (event) => {
    event.preventDefault();
    if (!feedbackOrder) return;

    const form = new FormData(event.currentTarget);
    addFeedback({
      order: feedbackOrder,
      rating: form.get("rating"),
      comment: form.get("comment"),
    });
    setNotice(`Thank you. Your feedback for ${feedbackOrder.reference_code} was sent to the farm.`);
    setFeedbackOrder(null);
  };

  const saveNotifications = async (event) => {
    event.preventDefault();
    if (!currentUser?.email) {
      setNotice("Please sign in again before updating notification settings.");
      return;
    }

    setSavingNotifications(true);
    try {
      const response = await api.post("/auth/profile/notifications/", {
        email: currentUser.email,
        phone,
        smsOptIn,
      });
      const updatedUser = response.data?.user;
      if (updatedUser) {
        updateCurrentUser({ phone: updatedUser.phone, smsOptIn: updatedUser.smsOptIn });
      }
      setNotice("Notification preferences saved. Approved orders will include an email receipt.");
    } catch (error) {
      setNotice(error.response?.data?.detail || "Could not save notification preferences.");
    } finally {
      setSavingNotifications(false);
    }
  };

  return (
    <AppShell
      portal="customer"
      title={isOrdersSection ? "Buyers Portal - Orders" : "Buyers Portal"}
      subtitle={
        isOrdersSection
          ? `Track approvals, pickup readiness, and feedback${currentUser?.fullName ? ` for ${currentUser.fullName}` : ""}.`
          : `Welcome back${currentUser?.fullName ? `, ${currentUser.fullName}` : ""}. Browse produce and place orders.`
      }
    >
      <div className="mb-6 overflow-hidden rounded-xl border border-white/70 bg-white/70 shadow-[0_16px_38px_rgba(15,23,42,0.09)] backdrop-blur-sm">
        <div className="relative">
          <img
            src="/farm-bg.png.jpg"
            alt=""
            className="h-36 w-full object-cover sm:h-44"
            style={{ filter: "blur(2px) brightness(0.6)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/65 via-slate-900/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-200">Shamba360</p>
            <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
              {isOrdersSection ? "Track approval, ready-for-pickup, and collection status" : "Shop fresh produce from trusted local farms"}
            </h2>
          </div>
        </div>
      </div>

      {usingDemoData && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Showing demo marketplace data until the backend is connected.
        </div>
      )}

      {notice && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-900">
          {notice}
        </div>
      )}

      {!isOrdersSection && (
      <section className="mb-6 rounded-lg border border-violet-200/70 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-violet-700">Nearby small-farm marketplace</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Buy produce with freshness, risk, and farm visibility.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Prioritize durable produce for regular supply, and move urgent perishables quickly when demand is high.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <HeroMetric label="High demand" value={inventory.filter((item) => item.market_demand === "High").length} />
            <HeroMetric label="Urgent perishables" value={inventory.filter((item) => item.handling_priority === "Urgent").length} />
            <HeroMetric label="Customer reviews" value={feedback.length} />
          </div>
        </div>
      </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard icon={<FaStore />} label="Available produce" value={inventory.length} />
        <SummaryCard icon={<FaClipboardList />} label="My orders" value={myOrders.length} />
        <SummaryCard icon={<FaMapMarkerAlt />} label="Nearby farms" value={nearbyFarms.length} />
      </section>

      <section className="mt-6">
        <DataPanel title="Profile & Email Alerts" icon={<FaClipboardCheck />}>
          <form onSubmit={saveNotifications} className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-gray-700">Phone number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="07XXXXXXXX or +2547XXXXXXXX"
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
                />
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={smsOptIn}
                  onChange={(event) => setSmsOptIn(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-700"
                />
                Enable approval and pickup email alerts
              </label>
            </div>

            <div className="flex items-end">
              <Button type="submit" className="min-h-10" disabled={savingNotifications}>
                {savingNotifications ? "Saving..." : "Save notifications"}
              </Button>
            </div>
          </form>
        </DataPanel>
      </section>

      {!isOrdersSection && (
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <DataPanel title="Available Produce" icon={<FaStore />}>
          <div className="grid gap-4 md:grid-cols-2">
            {inventory.map((item) => {
              const readyDays = daysSince(item.ready_since);
              return (
              <article key={item.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-950">{item.produce_type}</h2>
                    <p className="mt-1 text-sm text-gray-500">{item.farm_name || "Green Valley Farm"}</p>
                  </div>
                  <StatusBadge tone={Number(item.quantity) <= Number(item.low_stock_threshold) ? "amber" : "green"}>
                    {Number(item.quantity) <= Number(item.low_stock_threshold) ? "Limited" : "Available"}
                  </StatusBadge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
                  <Mini label="Available" value={`${item.quantity} ${item.unit}`} />
                  <Mini label="Ready" value={`${readyDays} day${readyDays === 1 ? "" : "s"} ago`} />
                  <Mini label="Demand" value={item.market_demand || "Medium"} />
                  <Mini label="Shelf life" value={`${item.shelf_life_days || 7} days`} />
                </div>
                {item.handling_priority === "Urgent" && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                    <FaFire className="mt-0.5 shrink-0" />
                    High attention: {item.storage_tip || "Move this produce quickly."}
                  </div>
                )}
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <p className="text-sm font-semibold text-gray-900">
                    KES {Number(item.unit_price).toLocaleString()} / {item.unit}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-green-700 px-3 text-sm font-semibold text-white hover:bg-green-800"
                  >
                    <FaShoppingBasket /> Order
                  </button>
                </div>
              </article>
              );
            })}
          </div>
        </DataPanel>

        <DataPanel
          title={selectedItem ? "Place Order" : "Nearby Farms"}
          icon={selectedItem ? <FaShoppingBasket /> : <FaMapMarkerAlt />}
          action={
            selectedItem && (
              <Button variant="secondary" className="min-h-9 w-auto px-3 py-1.5" onClick={() => setSelectedItem(null)}>
                Cancel
              </Button>
            )
          }
        >
          {selectedItem ? (
            <form onSubmit={submitOrder} className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4">
                <p className="font-bold text-green-950">{selectedItem.produce_type}</p>
                <p className="mt-1 text-sm text-green-800">
                  {selectedItem.farm_name} - KES {Number(selectedItem.unit_price).toLocaleString()} / {selectedItem.unit}
                </p>
              </div>
              <Field
                name="quantity"
                label={`Quantity (${selectedItem.unit})`}
                type="number"
                min="1"
                max={selectedItem.quantity}
                defaultValue="10"
              />
              <Field
                name="collection_date"
                label="Collection date"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
              <Button type="submit">Place order</Button>
            </form>
          ) : (
            <div className="space-y-3">
              {nearbyFarms.map((farm) => (
                <article key={farm.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-950">{farm.name}</p>
                      <p className="mt-1 text-sm text-gray-500">{farm.area}, {farm.county} - {farm.distance_km} km away</p>
                    </div>
                    <StatusBadge tone={healthTone[farm.health_status] || "gray"}>{farm.health_status}</StatusBadge>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">
                    Ready in {farm.produce_ready_days} day{Number(farm.produce_ready_days) === 1 ? "" : "s"}: {(farm.produce || []).join(", ")}
                  </p>
                </article>
              ))}
            </div>
          )}
        </DataPanel>
      </section>
      )}

      <section className="mt-6">
        <DataPanel
          title={feedbackOrder ? "Leave Purchase Feedback" : "Track My Orders"}
          icon={feedbackOrder ? <FaRegStar /> : <FaClipboardCheck />}
          action={
            feedbackOrder && (
              <Button variant="secondary" className="min-h-9 w-auto px-3 py-1.5" onClick={() => setFeedbackOrder(null)}>
                Cancel
              </Button>
            )
          }
        >
          {feedbackOrder ? (
            <form onSubmit={submitFeedback} className="grid gap-4 md:grid-cols-[0.6fr_1fr_auto]">
              <Field name="rating" label="Rating" type="number" min="1" max="5" defaultValue="5" />
              <Field name="comment" label="Comment" defaultValue="Produce was fresh and packed well." />
              <div className="flex items-end">
                <Button type="submit" className="min-h-10">Send feedback</Button>
              </div>
            </form>
          ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {myOrders.map((order) => (
              <div key={order.reference_code} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-950">{order.reference_code}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {order.quantity} {order.inventory_item__produce_type} from {order.farm_name || "Green Valley Farm"}
                    </p>
                  </div>
                  <StatusBadge tone={statusTone[order.status] || "gray"}>{order.status}</StatusBadge>
                </div>
                <p className="mt-3 text-xs font-medium text-gray-500">
                  Collection: {order.collection_date}
                </p>
                {order.status === "ready" && (
                  <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-900">
                    <p className="font-semibold">Payment details</p>
                    <p className="mt-1">{order.farm_mpesa_label || "M-Pesa details will be shared by the farm."}</p>
                    {order.farm_mpesa_account_reference && (
                      <p className="mt-1">Reference: {order.farm_mpesa_account_reference}</p>
                    )}
                    {order.farm_mpesa_account_name && (
                      <p className="mt-1">Account name: {order.farm_mpesa_account_name}</p>
                    )}
                  </div>
                )}
                {order.status !== "pending" && (
                  <a
                    href={`${import.meta.env.VITE_API_BASE_URL}/orders/${order.reference_code}/receipt/`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-violet-200 px-3 text-sm font-semibold text-violet-800 hover:bg-violet-50"
                  >
                    Download order slip
                  </a>
                )}
                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                  {(order.tracking || ["Order placed"]).map((step) => (
                    <div key={step} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="h-2 w-2 rounded-full bg-green-700" />
                      {step}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFeedbackOrder(order)}
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-green-200 px-3 text-sm font-semibold text-green-800 hover:bg-green-50"
                >
                  <FaRegStar /> Give feedback
                </button>
              </div>
            ))}
          </div>
          )}
        </DataPanel>
      </section>

      {!isOrdersSection && (
      <section className="mt-6">
        <DataPanel title="Recent Customer Feedback" icon={<FaRegStar />}>
          <div className="grid gap-4 md:grid-cols-2">
            {feedback.slice(0, 4).map((item) => (
              <article key={`${item.reference_code}-${item.comment}`} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-slate-950">{item.produce_type}</p>
                  <StatusBadge tone="green">{item.rating}/5</StatusBadge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.comment}</p>
                <p className="mt-3 text-xs font-semibold uppercase text-slate-400">{item.customer_name}</p>
              </article>
            ))}
          </div>
        </DataPanel>
      </section>
      )}
    </AppShell>
  );
}

function daysSince(date) {
  if (!date) return 0;
  const ready = new Date(`${date}T00:00:00`);
  const today = new Date();
  const diff = today.setHours(0, 0, 0, 0) - ready.getTime();
  return Math.max(Math.ceil(diff / 86400000), 0);
}

function Field({ label, name, type = "text", defaultValue, min, max }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        min={min}
        max={max}
        required
        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
      />
    </label>
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

function HeroMetric({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase text-gray-400">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-gray-950">{value}</p>
    </div>
  );
}

export default CustomerPortal;
