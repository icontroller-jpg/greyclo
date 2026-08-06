import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts } from "../services/productService";

const FILTERS = ["New", "Mens", "Womens", "Footwear", "Accessories", "Slides"];

export default function Collections() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("New");

  useEffect(() => {
    getProducts().then((data) => setProducts(data || []));
  }, []);

  const filtered = products.filter((p) => {
    if (activeFilter === "New") return true;
    return (p.category || "").toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <>
      <style>{`
        .col-page {
          min-height: 100vh;
          background: #fff;
        }

        .col-topbar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 20px 0;
        }

        .col-icon-btn {
          background: none;
          border: none;
          padding: 6px;
          margin: -6px;
          cursor: pointer;
          color: #111;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .col-filters {
          text-align: center;
          padding: 4px 16px 22px;
        }

        .col-filter-row {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0 14px;
        }

        .col-filter-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Didact Gothic', sans-serif;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(17,17,17,0.35);
          padding: 4px 2px;
        }

        .col-filter-btn.active {
          color: #2f6b3a;
        }

        .col-filter-row + .col-filter-row {
          margin-top: 2px;
        }

        .col-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          padding: 8px 20px 40px;
          column-gap: 20px;
          row-gap: 36px;
        }

        .col-empty {
          text-align: center;
          padding: 60px 20px;
          font-family: 'Didact Gothic', sans-serif;
          font-size: 12px;
          color: rgba(17,17,17,0.4);
        }

        .col-tile {
          text-decoration: none;
          display: block;
          text-align: center;
        }

        .col-tile-img {
          width: 100%;
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 14px;
        }

        .col-tile-img img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .col-tile-label {
          font-family: 'Didact Gothic', sans-serif;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #111;
        }

        @media (max-width: 480px) {
          .col-filters { font-size: 11px; }
        }
      `}</style>

      <div className="col-page">
        <div className="col-topbar">
          <button className="col-icon-btn" onClick={() => navigate(-1)} aria-label="Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button className="col-icon-btn" onClick={() => navigate("/cart")} aria-label="Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M6 6L4 3H2"/>
            </svg>
          </button>
        </div>

        <div className="col-filters">
          <div className="col-filter-row">
            {FILTERS.slice(0, 3).map((f) => (
              <button
                key={f}
                className={`col-filter-btn ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="col-filter-row">
            {FILTERS.slice(3).map((f) => (
              <button
                key={f}
                className={`col-filter-btn ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="col-empty">No pieces found in this category.</div>
        ) : (
          <div className="col-grid">
            {filtered.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="col-tile">
                <div className="col-tile-img">
                  <img src={p.image} alt={p.title} />
                </div>
                <div className="col-tile-label">{p.title}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}