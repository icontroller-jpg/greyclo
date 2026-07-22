import { HashRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/add" element={<AddProduct />} />
      </Routes>
    </HashRouter>
  );
}

export default App;