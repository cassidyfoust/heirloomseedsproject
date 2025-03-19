import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Navbar from "./components/Navbar";
import SeedLibrary from "./pages/SeedLibrary";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import AdminSeedInventory from "./pages/AdminSeedInventory";
import ManageOrders from "./pages/ManageOrders";
import ProtectedRoute from "./components/ProtectedRoute";
import { Seed, api } from "./services/api";
import OrderSuccess from "./pages/OrderSuccess";
import About from "./pages/About";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2e7d32",
    },
    secondary: {
      main: "#ffa000",
    },
  },
  typography: {
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 500,
    },
  },
});

function App() {
  const [selectedSeeds, setSelectedSeeds] = useState<Map<number, number>>(
    new Map()
  );
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleQuantityChange = (seed: Seed, change: number) => {
    setSelectedSeeds((prev) => {
      const newMap = new Map(prev);
      const currentQuantity = newMap.get(seed.id) || 0;
      const newQuantity = Math.max(
        0,
        Math.min(seed.quantity_available, currentQuantity + change)
      );

      if (newQuantity === 0) {
        newMap.delete(seed.id);
      } else {
        newMap.set(seed.id, newQuantity);
      }

      return newMap;
    });
  };

  const handleClearCart = () => {
    setSelectedSeeds(new Map());
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      console.log("Starting login process...");
      const response = await api.login(username, password);
      console.log("Login successful, response:", response);

      if (!response.token) {
        console.error("No token received in login response");
        throw new Error("Invalid login response");
      }

      console.log("Storing token in localStorage...");
      localStorage.setItem("token", response.token);
      console.log("Token stored successfully");

      setIsAuthenticated(true);
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error("Invalid username or password");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar
          selectedSeeds={selectedSeeds}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
        <Routes>
          <Route path="/" element={<About />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/seed-library"
            element={
              <SeedLibrary
                selectedSeeds={selectedSeeds}
                onQuantityChange={handleQuantityChange}
                onClearCart={handleClearCart}
                onSeedsUpdate={setSeeds}
                seeds={seeds}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <Cart
                selectedSeeds={selectedSeeds}
                seeds={seeds}
                onQuantityChange={handleQuantityChange}
                onClearCart={handleClearCart}
              />
            }
          />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AdminSeedInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ManageOrders />
              </ProtectedRoute>
            }
          />
          <Route path="/order-success" element={<OrderSuccess />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
