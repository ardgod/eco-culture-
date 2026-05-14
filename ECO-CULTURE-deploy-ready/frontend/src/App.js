import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Baskets from "./pages/Baskets";
import Courses from "./pages/Courses";
import UrbanGardens from "./pages/UrbanGardens";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OrderSuccess from "./pages/OrderSuccess";

function App() {
  return (
    <div className="App min-h-screen flex flex-col bg-background">
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalog />} />
                <Route path="/cestas" element={<Baskets />} />
                <Route path="/formacion" element={<Courses />} />
                <Route path="/huertos" element={<UrbanGardens />} />
                <Route path="/carrito" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pedido/:id" element={<OrderSuccess />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" richColors />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
