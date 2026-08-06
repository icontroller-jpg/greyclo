import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import { getSiteImages } from "../services/siteImageService";

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
    <>
      <style>{`
        .col-page {
          min-height: 100vh;
          background: #fff;
          padding: 0 0 80px;
        }

        .col-topbar {
          padding: 20px 24px 0;
        }

        .col-back {
          font-family: 'Didact Gothic', sans-serif;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #111;
          text-decoration: none;
        }

        .col-head {
          max-width: 640px;
          padding: 40px 24px 56px;
        }

        .col-title {
          font-family: 'Didact Gothic', sans-serif;
          font-weight: 400;
          font-size: 13px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #111;
          margin: 0 0 10px;
        }

        .col-sub {
          font-family: 'Didact Gothic', sans-serif;
          font-size: 13px;
          line-height: 1.7;
          color: rgba(17,17,17,0.55);
          margin: 0;
          max-width: 420px;
        }

        .col-featured {
          display: block;
          text-decoration: none;
          margin-bottom: 64px;
        }

        .col-featured-img {
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #f4f2ee;
          overflow: hidden;
        }

        .col-featured-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .col-featured-caption {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          padding: 16px 24px 0;
        }

        .col-featured-tag {
          font-family: 'Didact Gothic', sans-serif;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(17,17,17,0.4);
        }

        .col-featured-name {
          font-family: 'Didact Gothic', sans-serif;
          font-size: 13px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #111;
        }

        .col-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          padding: 0 24px;
        }

        .col-tile {
          text-decoration: none;
          display: block;
        }

        .col-tile-img {
          width: 100%;
          aspect-ratio: 3 / 4;
          background: #f4f2ee;
          overflow: hidden;
          margin-bottom: 12px;
          transition: opacity 0.25s ease;
        }

        .col-tile-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        @media (hover: hover) {
          .col-tile:hover .col-tile-img { opacity: 0.85; }
        }

        .col-tile-label {
          font-family: 'Didact Gothic', sans-serif;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #111;
          text-align: center;
        }

        .col-cta {
          text-align: center;
          padding: 72px 24px 0;
        }

        .col-cta p {
          font-family: 'Didact Gothic', sans-serif;
          font-size: 12px;
          color: rgba(17,17,17,0.5);
          margin: 0 0 14px;
        }

        .col-cta-link {
          font-family: 'Didact Gothic', sans-serif;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #111;
          text-decoration: none;
          border-bottom: 1px solid #111;
          padding-bottom: 2px;
        }

        @media (max-width: 700px) {
          .col-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .col-head { padding: 32px 20px 44px; }
          .col-topbar { padding: 16px 20px 0; }
        }
      `}</style>

      <div className="col-page">
        <div className="col-topbar">
          <Link to="/" className="col-back">← Back to Home</Link>
        </div>

        <div className="col-head">
          <h1 className="col-title">The Collections</h1>
          <p className="col-sub">
            No filler pieces, no reissues. Each collection is a limited run —
            once it's gone, it's part of the archive.
          </p>
        </div>

        {latest && (
          <Link to={`/product/${latest.id}`} className="col-featured">
            <div className="col-featured-img">
              <img src={latest.image} alt={latest.title} />
            </div>
            <div className="col-featured-caption">
              <span className="col-featured-tag">Current Drop</span>
              <span className="col-featured-name">{latest.title}</span>
            </div>
          </Link>
        )}

        <div className="col-grid">
          {CATEGORIES.map((c) => (
            <Link key={c.key} to={`/collection/${c.key}`} className="col-tile">
              <div className="col-tile-img">
                {siteImages[`category-${c.key}`] && (
                  <img src={siteImages[`category-${c.key}`]} alt={c.label} />
                )}
              </div>
              <div className="col-tile-label">{c.label}</div>
            </Link>
          ))}
        </div>

        <div className="col-cta">
          <p>Looking for something specific?</p>
          <Link to="/shop" className="col-cta-link">Browse the Full Catalog</Link>
        </div>
      </div>
    </>
  );
}