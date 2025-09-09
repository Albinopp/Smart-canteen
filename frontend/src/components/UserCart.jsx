import React, { useState, useEffect } from "react";

export default function UserCart() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    try {
      const res = await fetch("http://localhost:8080/user/cart", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch cart");

      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];
      setCart(items);

      // compute total price
      const totalPrice = items.reduce(
        (sum, item) => sum + item.price*item.quantity,
        0
      );
      setTotal(totalPrice);

    } catch (err) {
      console.error("Error fetching cart:", err);
      setCart([]);
      setTotal(0);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">My Cart</h2>

      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-teal-100 rounded-xl shadow-md"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                <p className="text-indigo-700 font-bold">
                  ₹ {item.price} × {item.quantity}
                </p>
              </div>
              <p className="text-lg font-bold text-gray-800">
                ₹ {item.price * item.quantity}
              </p>
            </div>
          ))}
          <div className="flex justify-between items-center border-t pt-4 mt-4">
            <h3 className="text-xl font-bold text-gray-900">Total</h3>
            <p className="text-xl font-bold text-indigo-700">₹ {total}</p>
          </div>
        </div>
      )}
    </div>
  );
}
