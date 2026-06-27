import { useEffect, useState } from "react";
import { FaClipboardList, FaLeaf, FaShoppingBasket, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

function CustomerPortal() {
  const [data, setData] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/dashboard/").then((response) => setData(response.data));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/customer-login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-green-700">Customer Portal</p>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {currentUser?.fullName}</h1>
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

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <FaLeaf className="text-green-700" />
            <h2 className="text-xl font-bold text-gray-900">Available Produce</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {(data?.inventory || []).map((item) => (
              <article key={item.id} className="rounded-lg border border-gray-200 p-4">
                <p className="font-bold text-gray-900">{item.produce_type}</p>
                <p className="mt-2 text-sm text-gray-600">
                  {item.quantity} {item.unit} available
                </p>
                <p className="mt-1 text-sm font-semibold text-green-700">
                  KES {Number(item.unit_price).toLocaleString()} / {item.unit}
                </p>
              </article>
            ))}
          </div>
        </section>

        <aside className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <FaClipboardList className="text-green-700" />
            <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
          </div>
          <div className="space-y-3">
            {(data?.orders || []).map((order) => (
              <div key={order.reference_code} className="rounded-lg border border-gray-200 p-4">
                <p className="font-semibold text-gray-900">{order.reference_code}</p>
                <p className="text-sm text-gray-600">
                  {order.quantity} x {order.inventory_item__produce_type}
                </p>
                <span className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  {order.status}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
          >
            <FaShoppingBasket /> Place Order
          </button>
        </aside>
      </main>
    </div>
  );
}

export default CustomerPortal;
