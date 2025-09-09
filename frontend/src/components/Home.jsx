import React, { useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/login");
    }
    if (role !== "user") {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-md">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-500">
          <span className="text-xl font-bold text-white">SmartCanteen</span>
        </div>

        {/* User Profile */}
        <div className="px-4 py-5 flex items-center space-x-3 border-b border-gray-100 bg-indigo-50">
          <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-indigo-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Hello, User</p>
            <p className="text-xs text-gray-500">Welcome Back</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link
            to="/products"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              isActive("/products")
                ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-l-4 border-indigo-600"
                : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
            }`}
          >
            🛒 <span className="ml-3">Products</span>
          </Link>

          <Link
            to="/cart"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              isActive("/cart")
                ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-l-4 border-indigo-600"
                : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
            }`}
          >
            🛒 <span className="ml-3">Cart</span>
          </Link>

          <Link
            to="/orders"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              isActive("/orders")
                ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-l-4 border-indigo-600"
                : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
            }`}
          >
            📦 <span className="ml-3">My Orders</span>
          </Link>

          <Link
            to="/history"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              isActive("/history")
                ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-l-4 border-indigo-600"
                : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
            }`}
          >
            📜 <span className="ml-3">History</span>
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:opacity-90 transition"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <h1 className="text-xl font-semibold text-gray-800">
              {isActive("/products") && "Browse Products"}
              {isActive("/orders") && "My Orders"}
              {isActive("/history") && "Order History"}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6">
          <div className="bg-white rounded-xl shadow-md p-6 min-h-[calc(100vh-8rem)] border border-gray-100">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
