import React, { useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = React.useState("");
  const [isHovered, setIsHovered] = React.useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const user_name = localStorage.getItem("user_name");

    if (user_name) {
      setUserName(user_name);
    }

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
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 font-sans relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Food Items */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `food-float ${8 + Math.random() * 12}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            {['🍕', '🍔', '🍟', '🌭', '🥗', '🍣', '🍦', '☕', '🥐', '🍩'][i % 10]}
          </div>
        ))}

        {/* Animated Conveyor Belt Lines */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 animate-conveyor-move"></div>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 animate-conveyor-move" style={{animationDelay: '0.3s'}}></div>
        </div>

        {/* Kitchen Steam Effects */}
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-white/5 rounded-full blur-xl animate-steam-puff"></div>
        <div className="absolute bottom-32 right-1/3 w-16 h-16 bg-white/3 rounded-full blur-lg animate-steam-puff" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-black/80 backdrop-blur-lg border-r border-gray-700 flex flex-col shadow-2xl relative z-10">
        {/* Animated Sidebar Decorations */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-white via-gray-400 to-black animate-light-sweep"></div>
        
        {/* Logo */}
        <div 
          className="flex items-center justify-center h-16 px-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-black relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-white to-gray-400 transition-all duration-1000 ${
            isHovered ? 'opacity-10' : 'opacity-5'
          }`}></div>
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 relative z-10">
            🍽️ SmartCanteen
          </span>
          <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white via-gray-400 to-white transform ${
            isHovered ? 'scale-x-100' : 'scale-x-0'
          } transition-transform duration-500`}></div>
        </div>

        {/* User Profile */}
        <div className="px-4 py-5 flex items-center space-x-3 border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
          <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-400 rounded-full flex items-center justify-center shadow-lg animate-profile-glow">
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
            <p className="text-sm font-medium text-white">Hello, {userName}</p>
            <p className="text-xs text-gray-400">Ready to order?</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-3">
          <Link
            to="/products"
            className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 border border-transparent relative overflow-hidden ${
              isActive("/products")
                ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white border-l-4 border-white shadow-lg"
                : "text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-600"
            }`}
          >
            <span className="text-lg mr-3 group-hover:scale-110 transition-transform duration-200">🍕</span>
            <span>Products Menu</span>
            <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white to-gray-400 transition-transform duration-300 ${
              isActive("/products") ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}></div>
          </Link>

          <Link
            to="/cart"
            className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 border border-transparent relative overflow-hidden ${
              isActive("/cart")
                ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white border-l-4 border-white shadow-lg"
                : "text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-600"
            }`}
          >
            <span className="text-lg mr-3 group-hover:scale-110 transition-transform duration-200">🛒</span>
            <span>My Cart</span>
            <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white to-gray-400 transition-transform duration-300 ${
              isActive("/cart") ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}></div>
          </Link>

          <Link
            to="/orders"
            className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 border border-transparent relative overflow-hidden ${
              isActive("/orders")
                ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white border-l-4 border-white shadow-lg"
                : "text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-600"
            }`}
          >
            <span className="text-lg mr-3 group-hover:scale-110 transition-transform duration-200">📦</span>
            <span>Current Orders</span>
            <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white to-gray-400 transition-transform duration-300 ${
              isActive("/orders") ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}></div>
          </Link>

          <Link
            to="/history"
            className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 border border-transparent relative overflow-hidden ${
              isActive("/history")
                ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white border-l-4 border-white shadow-lg"
                : "text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-600"
            }`}
          >
            <span className="text-lg mr-3 group-hover:scale-110 transition-transform duration-200">📜</span>
            <span>Order History</span>
            <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white to-gray-400 transition-transform duration-300 ${
              isActive("/history") ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}></div>
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="group w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg hover:from-gray-600 hover:to-gray-800 transition-all duration-300 border border-gray-600 hover:border-gray-400 relative overflow-hidden"
          >
            <span className="text-lg mr-2 group-hover:scale-110 transition-transform duration-200">🚪</span>
            <span>Logout</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <header className="bg-black/80 backdrop-blur-lg border-b border-gray-700 shadow-xl">
          <div className="flex items-center justify-between h-16 px-8">
            <h1 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
              {isActive("/products") && "🍕 Browse Our Menu"}
              {isActive("/cart") && "🛒 My Shopping Cart"}
              {isActive("/orders") && "📦 Current Orders"}
              {isActive("/history") && "📜 Order History"}
            </h1>
            
            {/* Animated Kitchen Status */}
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Kitchen: Online</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
          <div className="bg-black/60 backdrop-blur-md rounded-xl shadow-2xl p-6 min-h-[calc(100vh-8rem)] border border-gray-700 relative overflow-hidden">
            {/* Animated Corner Accents */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-3xl"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-white/5 to-transparent rounded-tr-3xl"></div>
            
            <Outlet />
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes food-float {
          0%, 100% {
            transform: translate(0px, 0px) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(50px, -30px) rotate(90deg) scale(1.1);
          }
          50% {
            transform: translate(25px, 40px) rotate(180deg) scale(0.9);
          }
          75% {
            transform: translate(-40px, 15px) rotate(270deg) scale(1.05);
          }
        }

        @keyframes conveyor-move {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes steam-puff {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.1;
          }
        }

        @keyframes light-sweep {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 0% 100%;
          }
        }

        @keyframes profile-glow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
          }
          50% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
          }
        }

        .animate-food-float {
          animation: food-float 15s ease-in-out infinite;
        }

        .animate-conveyor-move {
          animation: conveyor-move 4s linear infinite;
        }

        .animate-steam-puff {
          animation: steam-puff 6s ease-in-out infinite;
        }

        .animate-light-sweep {
          background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.1), transparent);
          background-size: 100% 200%;
          animation: light-sweep 3s ease-in-out infinite;
        }

        .animate-profile-glow {
          animation: profile-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}