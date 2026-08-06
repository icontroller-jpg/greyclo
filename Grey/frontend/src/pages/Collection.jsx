import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";
import "./Collections.css";

export default function Collections() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const latest = products[0] || null;

  return (
    <div className="collections-page">
      <div className="collections-head">
        <Link to="/" className="collections-back">← Back to Home</Link>
        <span className="collections-eyebrow">Every Drop, In One Place</span>
        <h1 className="collections-title">The<br />Collections.</h1>
        <p className="collections-sub">
          No filler pieces, no reissues. Each collection is a limited run —
          once it's gone, it's part of the archive.
        </p>
      </div>

      {latest && (
        <div
          className="collections-featured"
          style={{ backgroundImage: `url(${latest.image})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="collections-featured-content">
            <span className="collections-tag">Current Drop</span>
            <h2>{latest.title}</h2>
            <Link to={`/product/${latest.id}`} className="btn-primary">Shop This Piece</Link>
          </div>
        </div>
      )}

      <div className="collections-grid">
        {loading ? (
          <div className="collections-empty">Loading…</div>
        ) : products.length === 0 ? (
          <div className="collections-empty">No pieces here yet</div>
        ) : (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>

      <div className="collections-cta">
        <p>Looking for something specific?</p>
        <Link to="/shop" className="btn-ghost">Browse the Full Catalog →</Link>
      </div>
    </div>
  );
}