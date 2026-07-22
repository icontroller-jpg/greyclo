import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";
import "./Collection.css";

const CATEGORY_LABELS = {
  shirts: "Shirts",
  jackets: "Jackets",
  bottoms: "Bottoms",
};

export default function Collection() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getProducts().then((data) => {
      if (!active) return;
      setProducts((data || []).filter((p) => p.category === category));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [category]);

  const label = CATEGORY_LABELS[category] || category;

  return (
    <div className="collection-page">
      <div className="collection-head">
        <Link to="/" className="collection-back">← Back to Home</Link>
        <span className="collection-eyebrow">Collection</span>
        <h1 className="collection-title">{label}</h1>
        <p className="collection-count">
          {loading ? "Loading…" : `${products.length} piece${products.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="collection-grid">
        {loading ? (
          <div className="collection-empty">Loading…</div>
        ) : products.length === 0 ? (
          <div className="collection-empty">No pieces in this category yet</div>
        ) : (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>
    </div>
  );
}