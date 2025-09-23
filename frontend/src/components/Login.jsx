// File: Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [animationStage, setAnimationStage] = useState(0); // 0: delivery, 1: arrival, 2: settled
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role === "admin") {
      navigate("/admin");
    } else if (token && role === "user") {
      navigate("/");
    }

    // Animate food delivery sequence
    const timer1 = setTimeout(() => setAnimationStage(1), 2000);
    const timer2 = setTimeout(() => setAnimationStage(2), 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [navigate]);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email";
    if (!password) next.password = "Password is required";
    else if (password.length < 6) next.password = "Min 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setErrors({});

      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ form: data.error || "Login failed" });
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("user_name", data.username);

      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err?.message || "Login failed",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Kitchen Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Conveyor Belt */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900/80 to-transparent">
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-white/10 animate-conveyor-move"></div>
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/20 animate-conveyor-move" style={{animationDelay: '0.3s'}}></div>
        </div>
        
        {/* Kitchen Shelves */}
        <div className="absolute bottom-32 left-0 right-0 h-24 bg-gradient-to-t from-gray-800 to-transparent">
          <div className="flex justify-between px-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-1 bg-gray-700 mb-2"></div>
                <div className="w-12 h-1 bg-gray-600"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Food Particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${Math.random() * 100}%`,
              animation: `food-float ${4 + Math.random() * 6}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.3,
            }}
          >
            {['🍕', '🍔', '🍟', '🌭', '🥗', '🍣', '🍦', '☕'][i % 8]}
          </div>
        ))}
      </div>

      {/* Food Delivery Tray Animation */}
      <div className={`absolute bottom-32 left-0 transform ${
        animationStage === 0 ? 'animate-tray-delivery' : 
        animationStage === 1 ? 'animate-tray-arrive' : 
        'animate-tray-settle'
      }`}>
        <div className="relative">
          {/* Delivery Tray with Food */}
          <div className="relative w-48 h-24">
            {/* Tray */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-gray-400 rounded-lg">
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-44 h-2 bg-gray-500 rounded-full"></div>
            </div>
            
            {/* Food Items */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4">
              {/* Burger */}
              <div className="relative w-12 h-12 animate-burger-bounce">
                <div className="absolute bottom-0 w-12 h-1 bg-yellow-600 rounded"></div> {/* Bottom bun */}
                <div className="absolute bottom-1 w-12 h-4 bg-brown-500 rounded"></div> {/* Patty */}
                <div className="absolute bottom-5 w-10 h-1 bg-green-500 rounded mx-1"></div> {/* Lettuce */}
                <div className="absolute bottom-6 w-8 h-1 bg-red-500 rounded mx-2"></div> {/* Tomato */}
                <div className="absolute bottom-7 w-12 h-1 bg-yellow-600 rounded"></div> {/* Top bun */}
                <div className="absolute -top-1 left-4 w-4 h-2 bg-yellow-700 rounded-full"></div> {/* Sesame seeds */}
              </div>
              
              {/* Pizza Slice */}
              <div className="relative w-10 h-10 animate-pizza-rotate">
                <div className="w-10 h-10 bg-yellow-500 clip-path-pizza transform rotate-180">
                  <div className="absolute top-2 left-2 w-1 h-1 bg-red-500 rounded-full"></div>
                  <div className="absolute top-4 left-3 w-1 h-1 bg-red-500 rounded-full"></div>
                  <div className="absolute top-6 left-2 w-1 h-1 bg-red-500 rounded-full"></div>
                  <div className="absolute top-3 left-5 w-1 h-1 bg-green-300 rounded-full"></div>
                </div>
              </div>
              
              {/* Drink */}
              <div className="relative w-6 h-10 animate-drink-bubble">
                <div className="absolute bottom-0 w-6 h-8 bg-blue-400 rounded-t-lg rounded-b-sm">
                  <div className="absolute top-1 left-1 w-4 h-4 bg-blue-300 rounded-full animate-bubble-rise"></div>
                  <div className="absolute top-3 right-1 w-2 h-2 bg-blue-300 rounded-full animate-bubble-rise" style={{animationDelay: '0.5s'}}></div>
                </div>
                <div className="absolute -top-1 left-1 w-4 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>

            {/* Steam Effects */}
            {animationStage >= 1 && (
              <>
                <div className="absolute -top-4 left-1/4 w-2 h-6 bg-white/30 rounded-full animate-steam-rise"></div>
                <div className="absolute -top-6 left-1/2 w-3 h-8 bg-white/40 rounded-full animate-steam-rise" style={{animationDelay: '0.3s'}}></div>
                <div className="absolute -top-4 right-1/4 w-2 h-6 bg-white/30 rounded-full animate-steam-rise" style={{animationDelay: '0.6s'}}></div>
              </>
            )}
          </div>

          {/* Tray Shadow */}
          <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-3 bg-black/40 rounded-full blur-sm ${
            animationStage === 0 ? 'animate-shadow-move' : 
            animationStage === 1 ? 'animate-shadow-lift' : 
            'animate-shadow-steady'
          }`}></div>
        </div>
      </div>

      {/* Floating Utensils */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-xl"
            style={{
              top: `${10 + Math.random() * 80}%`,
              left: `${Math.random() * 100}%`,
              animation: `utensil-float ${5 + Math.random() * 8}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 4}s`,
              opacity: 0.4,
            }}
          >
            {['🍴', '🥄', '🥢', '🔪', '🍽️', '🥤'][i % 6]}
          </div>
        ))}
      </div>

      {/* Login Form Container */}
      <div className={`relative z-10 sm:mx-auto sm:w-full sm:max-w-md transform transition-all duration-1000 ${
        animationStage === 2 ? 'animate-form-appear' : 'opacity-0 translate-y-10'
      }`}>
        <div className="bg-black/60 backdrop-blur-lg border border-white/20 py-10 px-8 shadow-2xl rounded-xl sm:px-12">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-white to-gray-300 rounded-full flex items-center justify-center mr-3">
                <span className="text-2xl">🍽️</span>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Canteen Login
              </h2>
            </div>
            <p className="text-gray-400 text-sm">
              Delicious meals await! Or{" "}
              <Link
                to="/register"
                className="text-white hover:text-gray-300 transition-colors duration-300 underline font-medium"
              >
                create a new account
              </Link>
            </p>
          </div>

          {errors.form && (
            <div className="mb-6 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm animate-error-shake">
              <div className="flex items-center">
                <span className="text-lg mr-2">⚠️</span>
                {errors.form}
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <div className="flex items-center">
                  <span className="text-lg mr-2">📧</span>
                  Email address
                </div>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all duration-300"
              />
              {errors.email && (
                <p className="mt-2 text-red-400 text-sm animate-fade-in">{errors.email}</p>
              )}
            </div>

            <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <div className="flex items-center">
                  <span className="text-lg mr-2">🔒</span>
                  Password
                </div>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all duration-300"
              />
              {errors.password && (
                <p className="mt-2 text-red-400 text-sm animate-fade-in">{errors.password}</p>
              )}
            </div>

            <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-white to-gray-300 text-black font-bold rounded-lg hover:from-gray-200 hover:to-gray-100 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-2xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-3"></div>
                    Serving your account...
                  </div>
                ) : (
                  "Sign In to Order"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className={`relative z-10 mt-8 text-center transition-opacity duration-1000 ${
        animationStage === 2 ? 'opacity-100' : 'opacity-0'
      }`}>
        <p className="text-gray-500 text-sm animate-pulse">
          🍕 Fresh meals served daily! 🍔
        </p>
      </div>

      <style jsx>{`
        @keyframes tray-delivery {
          0% {
            transform: translateX(-300px);
          }
          100% {
            transform: translateX(calc(50vw - 96px));
          }
        }

        @keyframes tray-arrive {
          0% {
            transform: translateX(calc(50vw - 96px)) translateY(0);
          }
          50% {
            transform: translateX(calc(50vw - 96px)) translateY(-80px);
          }
          100% {
            transform: translateX(calc(50vw - 96px)) translateY(-60px);
          }
        }

        @keyframes tray-settle {
          0% {
            transform: translateX(calc(50vw - 96px)) translateY(-60px);
          }
          100% {
            transform: translateX(calc(50vw - 96px)) translateY(-140px);
          }
        }

        @keyframes burger-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes pizza-rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes drink-bubble {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes bubble-rise {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-10px);
            opacity: 0;
          }
        }

        @keyframes steam-rise {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-20px) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes shadow-move {
          0%, 100% {
            transform: translateX(-50%) scale(0.8);
          }
          50% {
            transform: translateX(-50%) scale(1.1);
          }
        }

        @keyframes shadow-lift {
          0% {
            transform: translateX(-50%) scale(1);
          }
          50% {
            transform: translateX(-50%) scale(0.6);
          }
          100% {
            transform: translateX(-50%) scale(0.8);
          }
        }

        @keyframes shadow-steady {
          0% {
            transform: translateX(-50%) scale(0.8);
          }
          100% {
            transform: translateX(-50%) scale(0.6);
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

        @keyframes food-float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateY(10px) rotate(240deg);
          }
        }

        @keyframes utensil-float {
          0%, 100% {
            transform: translate(0px, 0px) rotate(0deg);
          }
          25% {
            transform: translate(30px, -15px) rotate(90deg);
          }
          50% {
            transform: translate(15px, 20px) rotate(180deg);
          }
          75% {
            transform: translate(-25px, 5px) rotate(270deg);
          }
        }

        @keyframes form-appear {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes error-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .clip-path-pizza {
          clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
        }

        .bg-brown-500 { background-color: #8B4513; }
        .bg-brown-500 { background-color: #8B4513; }

        .animate-tray-delivery {
          animation: tray-delivery 2s ease-out forwards;
        }

        .animate-tray-arrive {
          animation: tray-arrive 1s ease-in-out forwards;
        }

        .animate-tray-settle {
          animation: tray-settle 0.5s ease-out forwards;
        }

        .animate-burger-bounce {
          animation: burger-bounce 2s ease-in-out infinite;
        }

        .animate-pizza-rotate {
          animation: pizza-rotate 4s linear infinite;
        }

        .animate-drink-bubble {
          animation: drink-bubble 3s ease-in-out infinite;
        }

        .animate-bubble-rise {
          animation: bubble-rise 2s ease-in-out infinite;
        }

        .animate-steam-rise {
          animation: steam-rise 3s ease-in-out infinite;
        }

        .animate-shadow-move {
          animation: shadow-move 2s ease-in-out infinite;
        }

        .animate-shadow-lift {
          animation: shadow-lift 1s ease-in-out forwards;
        }

        .animate-shadow-steady {
          animation: shadow-steady 0.5s ease-out forwards;
        }

        .animate-conveyor-move {
          animation: conveyor-move 3s linear infinite;
        }

        .animate-food-float {
          animation: food-float 8s ease-in-out infinite;
        }

        .animate-utensil-float {
          animation: utensil-float 10s ease-in-out infinite;
        }

        .animate-form-appear {
          animation: form-appear 1s ease-out forwards;
        }

        .animate-error-shake {
          animation: error-shake 0.5s ease-in-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
}