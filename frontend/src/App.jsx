import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Admin from "./components/Admin";
import Products from "./components/Products";
import Bookings from "./components/Bookings";
import Home from "./components/Home";
import UserProducts from "./components/UserProducts";
import UserCart from "./components/UserCart";
import OrderHistory from "./components/OrderHistory";
import UserComplaints from "./components/UserComplaints";
import Complaints from "./components/Complaints";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Register Page */}
        <Route path="/register" element={<Register />} />

        {/* Canteen Menu Page */}
        <Route
          path="/" element={<Home />} 
        >
          <Route index element={<UserProducts />} /> 
          <Route path="products" element={<UserProducts />} />
          <Route path="cart" element={<UserCart />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="complaints" element={<UserComplaints/>} />
        </Route>
        {/* Admin Routes with nested pages */}
        <Route
          path="/admin" element={<Admin />}
        >
          <Route index element={<Products />} /> 
          <Route path="products" element={<Products />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="complaints" element={<Complaints/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
