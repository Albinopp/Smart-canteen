import React, { useState, useEffect } from "react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });
  const [editProduct, setEditProduct] = useState(null);
  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:8080/products", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  // Handle input changes
  const handleChange = (e, isEdit = false) => {
    if (isEdit) {
      setEditProduct({ ...editProduct, [e.target.name]: e.target.value });
    } else {
      setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
    }
  };

  // ✅ Add product
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
      alert("Please fill required fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          quantity: parseInt(newProduct.quantity),
        }),
      });

      if (!res.ok) throw new Error("Failed to add product");

      await fetchProducts();
      setNewProduct({ name: "", description: "", price: "", quantity: "" });
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Error adding product");
    }
  };

  // ✅ Delete product
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete product");
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
      alert("Error deleting product");
    }
  };

  // ✅ Increase quantity
  const handleIncreaseQty = async (product) => {
    try {
      const res = await fetch(`http://localhost:8080/products/${product.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          ...product,
          quantity: product.quantity + 1,
        }),
      });

      if (!res.ok) throw new Error("Failed to update quantity");
      await fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Error updating quantity");
    }
  };

  // ✅ Open Edit Modal
  const handleEdit = (product) => {
    setEditProduct(product);
    setIsEditModalOpen(true);
  };

  // ✅ Save Edited Product
  const handleUpdateProduct = async () => {
    if (!editProduct.name || !editProduct.price || !editProduct.quantity) {
      alert("Please fill required fields");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/products/${editProduct.id}`,
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            name: editProduct.name,
            description: editProduct.description,
            price: parseFloat(editProduct.price),
            quantity: parseInt(editProduct.quantity),
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update product");
      await fetchProducts();
      setIsEditModalOpen(false);
      setEditProduct(null);
    } catch (error) {
      console.error(error);
      alert("Error updating product");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-700">
          Manage Products 🛠️
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition"
        >
          + Add Product
        </button>
      </div>

      {/* Products List */}
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
              <h3 className="text-lg font-semibold text-gray-800">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600">{product.description}</p>
              <p className="text-indigo-700 font-bold">
                ₹ {product.price} | Qty: {product.quantity}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleIncreaseQty(product)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Qty
              </button>
              <button
                onClick={() => handleEdit(product)}
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
        ))
      )}
    </div>


      {/* Add Modal */}
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
                name="description"
                value={newProduct.description}
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

      {/* Edit Modal */}
      {isEditModalOpen && editProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm">
          <div className="bg-white w-96 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Edit Product</h3>
            <div className="space-y-3">
              <input
                type="text"
                name="name"
                value={editProduct.name}
                onChange={(e) => handleChange(e, true)}
                placeholder="Product Name"
                className="w-full px-3 py-2 border rounded"
              />
              <textarea
                name="description"
                value={editProduct.description}
                onChange={(e) => handleChange(e, true)}
                placeholder="Description"
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="number"
                name="price"
                value={editProduct.price}
                onChange={(e) => handleChange(e, true)}
                placeholder="Price"
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="number"
                name="quantity"
                value={editProduct.quantity}
                onChange={(e) => handleChange(e, true)}
                placeholder="Quantity"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProduct}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
