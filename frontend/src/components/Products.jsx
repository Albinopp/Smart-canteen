import React, { useState } from "react";

export default function Products() {
  const [products, setProducts] = useState([
    { id: 1, name: "Veg Sandwich", desc: "Fresh and tasty sandwich", price: 50, quantity: 10 },
    { id: 2, name: "Coffee", desc: "Hot brewed coffee", price: 20, quantity: 15 },
    { id: 3, name: "Burger", desc: "Cheesy chicken burger", price: 80, quantity: 8 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    desc: "",
    price: "",
    quantity: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  // Add product
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
      alert("Please fill required fields");
      return;
    }
    const newItem = {
      id: products.length + 1,
      ...newProduct,
      price: parseFloat(newProduct.price),
      quantity: parseInt(newProduct.quantity),
    };
    setProducts([...products, newItem]);
    setNewProduct({ name: "", desc: "", price: "", quantity: "" });
    setIsModalOpen(false);
  };

  // Delete product
  const handleDelete = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  // Increase quantity
  const handleIncreaseQty = (id) => {
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p
      )
    );
  };

  // Edit product (basic inline alert for now)
  const handleEdit = (id) => {
    const prod = products.find((p) => p.id === id);
    alert(`Edit Product: ${prod.name}\n(You can replace with edit modal)`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-700">Manage Products 🛠️</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition"
        >
          + Add Product
        </button>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl shadow-md"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.desc}</p>
              <p className="text-indigo-700 font-bold">
                ₹ {product.price} | Qty: {product.quantity}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleIncreaseQty(product.id)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Qty
              </button>
              <button
                onClick={() => handleEdit(product.id)}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm">
          <div className="bg-white w-96 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Add New Product</h3>
            <div className="space-y-3">
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleChange}
                placeholder="Product Name"
                className="w-full px-3 py-2 border rounded"
              />
              <textarea
                name="desc"
                value={newProduct.desc}
                onChange={handleChange}
                placeholder="Description"
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="number"
                name="price"
                value={newProduct.price}
                onChange={handleChange}
                placeholder="Price"
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="number"
                name="quantity"
                value={newProduct.quantity}
                onChange={handleChange}
                placeholder="Quantity"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
