import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import { getSiteImages } from "../services/siteImageService";
import "./Collections.css";

function bg(url) {
  return url ? { backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center" } : {};
}

const CATEGORIES = [
  { key: "shirts", label: "Shirts" },
  { key: "jackets", label: "Jackets" },
  { key: "bottoms", label: "Bottoms" },
];

export default function Collections() {
  const [siteImages, setSiteImages] = useState({});
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    getSiteImages().then(setSiteImages);
    getProducts().then((data) => {
      if (data && data.length > 0) setLatest(data[0]);
    });
  }, []);

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
        <div className="collections-featured" style={bg(latest.image)}>
          <div className="collections-featured-content">
            <span className="collections-tag">Current Drop</span>
            <h2>{latest.title}</h2>
            <Link to={`/product/${latest.id}`} className="btn-primary">Shop This Piece</Link>
          </div>
        </div>
      )}

      <div className="collections-tiles">
        {CATEGORIES.map((c) => (
          <Link
            key={c.key}
            to={`/collection/${c.key}`}
            className="collections-tile"
            style={bg(siteImages[`category-${c.key}`])}
          >
            <span className="collections-tile-label">{c.label}</span>
            <span className="collections-tile-arrow">→</span>
          </Link>
        ))}
      </div>

      <div className="collections-cta">
        <p>Looking for something specific?</p>
        <Link to="/shop" className="btn-ghost">Browse the Full Catalog →</Link>
      </div>
    </div>
  );
}