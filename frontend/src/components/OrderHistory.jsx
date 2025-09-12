import React, { useEffect, useState } from "react";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:8080/user/order/history", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className="text-gray-600">Loading order history...</p>;

  if (orders.length === 0)
    return <p className="text-gray-600">You have no past orders.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">My Orders</h2>
      <div className="space-y-6">
        {orders.map((order, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg shadow-md bg-gradient-to-r from-yellow-50 to-orange-50"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Order ID: {order.id}
            </h3>
            <p className="text-sm text-gray-600">
              Status:{" "}
              <span
                className={
                  order.status.toLowerCase() === "paid"
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {order.status}
              </span>
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Total: ₹ {order.total}
            </p>

            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-white p-2 rounded shadow-sm"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                  <p className="font-bold text-gray-700">₹ {item.total}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-2">
              Ordered on:{" "}
              {new Date(order.createdAt * 1000).toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
