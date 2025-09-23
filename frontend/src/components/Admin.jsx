import React, { useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

export default function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = React.useState("");
  const [isHovered, setIsHovered] = React.useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("user_name");
    
    if (name) {
      setName(name);
    }

    if (!token) {
      navigate("/login");
    }
    if (role !== "admin") {
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
        {/* Floating Admin & Food Items */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-xl opacity-10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `admin-float ${10 + Math.random() * 15}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          >
            {['📊', '📈', '🍽️', '👨‍💼', '📋', '💰', '🍕', '📦', '⏰', '🔔'][i % 10]}
          </div>
        ))}

        {/* Animated Dashboard Lines */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 animate-dashboard-scan"></div>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 animate-dashboard-scan" style={{animationDelay: '1s'}}></div>
        </div>

        {/* Admin Panel Effects */}
        <div className="absolute top-20 right-1/4 w-16 h-16 bg-white/3 rounded-full blur-lg animate-data-pulse"></div>
        <div className="absolute bottom-40 left-1/3 w-12 h-12 bg-white/2 rounded-full blur-md animate-data-pulse" style={{animationDelay: '3s'}}></div>
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-black/80 backdrop-blur-lg border-r border-gray-700 flex flex-col shadow-2xl relative z-10">
        {/* Animated Sidebar Decorations */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-white via-gray-400 to-black animate-light-sweep"></div>
        
        {/* Logo/Brand */}
        <div 
          className="flex items-center justify-center h-16 px-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-black relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-white to-gray-400 transition-all duration-1000 ${
            isHovered ? 'opacity-10' : 'opacity-5'
          }`}></div>
          <div className="flex items-center space-x-2 relative z-10">
            <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-300 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-lg">👨‍💼</span>
            </div>
            <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
              AdminPro
            </span>
          </div>
          <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white via-gray-400 to-white transform ${
            isHovered ? 'scale-x-100' : 'scale-x-0'
          } transition-transform duration-500`}></div>
        </div>
        
        {/* User Profile Summary */}
        <div className="px-4 py-5 flex items-center space-x-3 border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
          <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-400 rounded-full flex items-center justify-center shadow-lg animate-profile-glow">
            <span className="text-xl">👑</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{name}</p>
            <p className="text-xs text-gray-400 truncate">Head Administrator</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-3">
          <Link
            to="/admin/products"
            className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 border border-transparent relative overflow-hidden ${
              isActive("/admin/products")
                ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white border-l-4 border-white shadow-lg"
                : "text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-600"
            }`}
          >
            <span className="text-lg mr-3 group-hover:scale-110 transition-transform duration-200">🍕</span>
            <span>Menu Management</span>
            <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white to-gray-400 transition-transform duration-300 ${
              isActive("/admin/products") ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}></div>
          </Link>
          
          <Link
            to="/admin/bookings"
            className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 border border-transparent relative overflow-hidden ${
              isActive("/admin/bookings")
                ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white border-l-4 border-white shadow-lg"
                : "text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-600"
            }`}
          >
            <span className="text-lg mr-3 group-hover:scale-110 transition-transform duration-200">📋</span>
            <span>Orders Dashboard</span>
            <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white to-gray-400 transition-transform duration-300 ${
              isActive("/admin/bookings") ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}></div>
          </Link>
          
          <Link
            to="/admin/transactions"
            className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 border border-transparent relative overflow-hidden ${
              isActive("/admin/transactions")
                ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white border-l-4 border-white shadow-lg"
                : "text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-600"
            }`}
          >
            <span className="text-lg mr-3 group-hover:scale-110 transition-transform duration-200">💰</span>
            <span>Revenue Analytics</span>
            <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white to-gray-400 transition-transform duration-300 ${
              isActive("/admin/transactions") ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}></div>
          </Link>

          {/* Additional Admin Links */}
          <Link
            to="/admin/analytics"
            className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 border border-transparent relative overflow-hidden ${
              isActive("/admin/analytics")
                ? "bg-gradient-to-r from-gray-700 to-gray-800 text-white border-l-4 border-white shadow-lg"
                : "text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-600"
            }`}
          >
            <span className="text-lg mr-3 group-hover:scale-110 transition-transform duration-200">📊</span>
            <span>Business Insights</span>
            <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white to-gray-400 transition-transform duration-300 ${
              isActive("/admin/analytics") ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
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
            <span>Admin Logout</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <header className="bg-black/80 backdrop-blur-lg border-b border-gray-700 shadow-xl">
          <div className="flex items-center justify-between h-16 px-8">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                {isActive("/admin/products") && "🍽️ Menu Management"}
                {isActive("/admin/bookings") && "📋 Orders Dashboard"}
                {isActive("/admin/transactions") && "💰 Revenue Analytics"}
                {isActive("/admin/analytics") && "📊 Business Insights"}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notification Bell with Animation */}
              <button className="group p-2 text-gray-400 bg-gray-800 rounded-full hover:bg-gray-700 transition-all duration-300 relative">
                <span className="text-lg">🔔</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              
              {/* Admin Profile */}
              <div className="relative group">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm">👑</span>
                  </div>
                  <span className="text-sm font-medium text-gray-300">Admin</span>
                  <span className="text-gray-500 group-hover:text-gray-400 transition-colors">▼</span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-black/90 backdrop-blur-lg rounded-lg shadow-2xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-2">
                    <div className="px-3 py-2 text-sm text-gray-300 border-b border-gray-700">
                      Signed in as <strong>{name}</strong>
                    </div>
                    <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-md transition-colors">
                      🚪 Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
          <div className="bg-black/60 backdrop-blur-md rounded-xl shadow-2xl p-6 min-h-[calc(100vh-8rem)] border border-gray-700 relative overflow-hidden">
            {/* Animated Corner Accents */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-3xl"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-white/5 to-transparent rounded-tr-3xl"></div>
            
            {/* Status Bar */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-300">System: Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-300">Kitchen: Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-300">Orders: Processing</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                Last updated: Just now
              </div>
            </div>
            
            <Outlet />
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes admin-float {
          0%, 100% {
            transform: translate(0px, 0px) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(40px, -25px) rotate(90deg) scale(1.1);
          }
          50% {
            transform: translate(20px, 35px) rotate(180deg) scale(0.9);
          }
          75% {
            transform: translate(-35px, 12px) rotate(270deg) scale(1.05);
          }
        }

        @keyframes dashboard-scan {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes data-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.3);
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

        .animate-admin-float {
          animation: admin-float 18s ease-in-out infinite;
        }

        .animate-dashboard-scan {
          animation: dashboard-scan 3s linear infinite;
        }

        .animate-data-pulse {
          animation: data-pulse 4s ease-in-out infinite;
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