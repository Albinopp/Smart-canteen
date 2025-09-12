import React, { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:8080/admin/orders", {
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

  const markDelivered = async (orderId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/admin/order/${orderId}/deliver`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to update order");

      fetchOrders();
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Could not update order status.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className="text-gray-600">Loading orders...</p>;

  if (orders.length === 0)
    return <p className="text-gray-600">No orders found.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">All Orders</h2>
      <div className="space-y-6">
        {orders.map((order, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg shadow-md bg-gradient-to-r from-blue-50 to-indigo-50"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Order ID: {order.id}
            </h3>
            <p className="text-sm text-gray-600">
              Customer:{" "}
              <span className="font-semibold">
                {order.customerName} ({order.customerEmail})
              </span>
            </p>
            <p className="text-sm text-gray-600">Total: ₹ {order.total}</p>
            <p className="text-sm text-gray-600 mb-2">
              Status:{" "}
              <span
                className={
                  order.status.toLowerCase() === "delivered"
                    ? "text-green-600 font-semibold"
                    : "text-orange-600 font-semibold"
                }
              >
                {order.status}
              </span>
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

            <button
              onClick={() =>
                order.status.toLowerCase() !== "delivered" &&
                markDelivered(order.id)
              }
              disabled={order.status.toLowerCase() === "delivered"}
              className={`mt-3 px-4 py-2 rounded transition ${
                order.status.toLowerCase() === "delivered"
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {order.status.toLowerCase() === "delivered"
                ? "Delivered ✅"
                : "Mark as Delivered"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
