import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";
import { CATEGORIES } from "../constants/categories";
import "./Shop.css";

const FILTERS = [{ value: "all", label: "All" }, ...CATEGORIES];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("all");

  useEffect(() => {
    let mounted = true;
    getProducts().then((data) => {
      if (!mounted) return;
      setProducts(data || []);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const visible = useMemo(() => {
    if (active === "all") return products;
    return products.filter((p) => p.category === active);
  }, [products, active]);

  return (
    <div className="shop-page">
      <div className="shop-head">
        <Link to="/" className="shop-back">← Back to Home</Link>
        <span className="shop-eyebrow">Full Catalog</span>
        <h1 className="shop-title">Shop All.</h1>
        <p className="shop-count">
          {loading ? "Loading…" : `${visible.length} piece${visible.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="shop-filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`shop-filter-btn ${active === f.value ? "active" : ""}`}
            onClick={() => setActive(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="shop-grid">
        {loading ? (
          <div className="shop-empty">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="shop-empty">No pieces here yet</div>
        ) : (
          visible.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>
    </div>
  );
}