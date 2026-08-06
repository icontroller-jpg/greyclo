import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import "./Collections.css";

const CATEGORIES = ["NEW", "MENS", "WOMENS", "FOOTWEAR", "ACCESSORIES", "SLIDES"];

export default function Collections() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("NEW");

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
    if (active === "NEW") return products;
    return products.filter(
      (p) => (p.category || "").toUpperCase() === active
    );
  }, [products, active]);

  return (
    <div className="cx-page">
      <header className="cx-topbar">
        <Link to="/" className="cx-mark" aria-label="Home">
          +
        </Link>
        <nav className="cx-nav" aria-label="Collections">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`cx-nav-item ${active === c ? "is-active" : ""}`}
              onClick={() => setActive(c)}
            >
              {c}
            </button>
          ))}
        </nav>
        <Link to="/cart" className="cx-cart" aria-label="Cart">
          ⊙
        </Link>
      </header>

      <main className="cx-grid" role="list">
        {loading ? (
          <p className="cx-empty">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="cx-empty">Nothing in this section yet.</p>
        ) : (
          visible.map((p) => (
            <Link
              to={`/product/${p.id}`}
              key={p.id}
              className="cx-tile"
              role="listitem"
            >
              <div className="cx-tile-img">
                <img src={p.image} alt={p.title} loading="lazy" />
              </div>
              <span className="cx-tile-code">{p.code || p.title}</span>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}