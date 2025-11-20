import React, { useEffect, useState } from "react";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [feedbackItem, setFeedbackItem] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isEdit, setIsEdit] = useState(false); // track edit mode

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

  const submitFeedback = async () => {
    if (!feedbackItem) return;

    try {
      const url = isEdit
        ? "http://localhost:8080/user/product/feedback/edit"
        : "http://localhost:8080/user/product/feedback";

      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: feedbackItem.productId,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit feedback");

      alert(isEdit ? "Feedback updated successfully!" : "Feedback submitted successfully!");

      setOrders((prev) =>
        prev.map((o) =>
          o.id === feedbackItem.orderId
            ? {
                ...o,
                items: o.items.map((i) =>
                  i.productId === feedbackItem.productId
                    ? { ...i, feedback: { rating, comment } }
                    : i
                ),
              }
            : o
        )
      );

      setShowModal(false);
      setRating(0);
      setComment("");
      setIsEdit(false);
    } catch (err) {
      alert("Error: " + err.message);
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
                  order.status.toLowerCase() === "delivered"
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
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 rounded shadow-sm"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 sm:mt-0">
                    <p className="font-bold text-gray-700">₹ {item.total}</p>
                    {order.status.toLowerCase() === "delivered" && (
                      <button
                        onClick={() => {
                          const fb = item.feedback?.[0] || null;
                          
                          setFeedbackItem({
                            orderId: order.id,
                            productId: item.productId,
                          });
                          setRating(fb?.rating || 0);
                          setComment(fb?.comment || "");
                          setIsEdit(!!fb); 
                          setShowModal(true);
                        }}
                        className="mt-2 sm:mt-0 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                      >
                        {item.feedback ? "Edit Feedback" : "Submit Feedback"}
                      </button>
                    )}
                  </div>
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

      {/* Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">
              {isEdit ? "Edit Feedback" : "Submit Feedback"}
            </h3>

            {/* Stars */}
            <div className="flex space-x-1 mb-4">
              {[...Array(5)].map((_, i) => {
                const starValue = i + 1;
                return (
                  <svg
                    key={i}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHover(starValue)}
                    onMouseLeave={() => setHover(0)}
                    className={`w-8 h-8 cursor-pointer ${
                      starValue <= (hover || rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.378 2.455a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.378-2.454a1 1 0 00-1.176 0l-3.378 2.454c-.784.57-1.838-.197-1.539-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.05 9.397c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.95-.69l1.287-3.97z" />
                  </svg>
                );
              })}
            </div>

            {/* Comment Box */}
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows="3"
              placeholder="Write your feedback..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                {isEdit ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
