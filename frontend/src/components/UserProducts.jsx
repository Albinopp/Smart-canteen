import React, { useState, useEffect } from "react";

export default function UserProducts() {
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:8080/products", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      const safeData = Array.isArray(data) ? data : data?.products ?? [];
      setProducts(safeData);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setModalOpen(true);
  };

  const handleAddProductToCart = async () => {
    try {
      const res = await fetch(`http://localhost:8080/addtocart/${selectedProduct.id}/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          quantity: parseInt(quantity),
        }),
      });

      if (!res.ok) throw new Error("Failed to add product to cart");

      alert(`Added ${quantity} x ${selectedProduct.name} to cart`);
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Error adding to cart");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-700">Food Items Available</h2>
      </div>

      <div className="space-y-4">
        {products.length === 0 ? (
          <p className="text-gray-500">No products available</p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl shadow-md"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
                <p className="text-indigo-700 font-bold">
                  ₹ {product.price} | Qty: {product.quantity}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(product)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-red-600"
                >
                  Add to cart
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quantity Modal */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80">
            <h3 className="text-xl font-semibold mb-4">
              Add {selectedProduct.name} to Cart
            </h3>

            <div className="flex items-center gap-2 mb-4">
              <button
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <input
                type="number"
                className="w-16 text-center border rounded px-2 py-1"
                value={quantity}
                min={1}
                max={selectedProduct.quantity * 10} // allow more than stock if desired
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
              <button
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                onClick={handleAddProductToCart}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
