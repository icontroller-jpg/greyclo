import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import { getProduct } from "../services/productService";
import { CartContext } from "../context/CartContext";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    setAdded(false);
    setActiveIndex(0);
    setExpanded(false);
    getProduct(id).then(setProduct);
  }, [id]);

  if (!product) return <p className="pp-loading">Loading…</p>;

  const gallery =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.image)
      : [product.image];

  const handleCartClick = async () => {
    if (added) {
      navigate("/cart");
      return;
    }
    setAdding(true);
    try {
      await addToCart(product, 1);
      setAdded(true);
    } catch (err) {
      console.error("Failed to add to cart:", err.message);
      alert("Couldn't add to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null || gallery.length <= 1) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 40) {
      setActiveIndex((i) => (i === 0 ? gallery.length - 1 : i - 1));
    } else if (delta < -40) {
      setActiveIndex((i) => (i === gallery.length - 1 ? 0 : i + 1));
    }
    touchStartX.current = null;
  };

  return (
    <>
      <style>{`
        .pp-page {
          min-height: 100vh;
          background: #f4f2ee;
          display: flex;
          justify-content: center;
        }

        .pp-wrap {
          width: 100%;
          max-width: 480px;
          background: #fff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .pp-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 20px 0;
        }

        .pp-icon-btn {
          background: none;
          border: none;
          padding: 8px;
          margin: -8px;
          cursor: pointer;
          color: #111;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pp-gallery {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          touch-action: pan-y;
        }

        .pp-slide-track {
          display: flex;
          width: 100%;
          height: 100%;
          transition: transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
        }

        .pp-slide {
          width: 100%;
          height: 100%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pp-slide img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .pp-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          padding: 16px 0;
        }

        .pp-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #d4d0c8;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }

        .pp-dot.active {
          background: #111;
          transform: scale(1.4);
        }

        .pp-details {
          text-align: center;
          padding: 8px 24px 0;
        }

        .pp-title {
          font-family: 'Didact Gothic', sans-serif;
          font-weight: 400;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #111;
          margin: 0 0 6px;
        }

        .pp-price {
          font-family: 'Didact Gothic', sans-serif;
          font-size: 13px;
          color: rgba(17,17,17,0.6);
          margin: 0;
        }

        .pp-expand-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #111;
          padding: 18px;
          margin: 4px auto 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s ease;
        }

        .pp-expand-btn.open {
          transform: rotate(45deg);
        }

        .pp-panel {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.35s ease;
          padding: 0 24px;
        }

        .pp-panel.open {
          max-height: 400px;
        }

        .pp-desc {
          font-family: 'Didact Gothic', sans-serif;
          font-size: 12px;
          line-height: 1.7;
          color: rgba(17,17,17,0.65);
          text-align: center;
          padding-bottom: 20px;
        }

        .pp-cart-btn {
          width: calc(100% - 48px);
          margin: 0 24px 28px;
          background: #111;
          color: #fff;
          border: none;
          padding: 15px;
          font-family: 'Didact Gothic', sans-serif;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .pp-cart-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .pp-spacer { flex: 1; }
      `}</style>

      <div className="pp-page">
        <div className="pp-wrap">
          <div className="pp-topbar">
            <button className="pp-icon-btn" onClick={() => navigate(-1)} aria-label="Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="pp-icon-btn" onClick={() => navigate("/cart")} aria-label="Cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M6 6L4 3H2"/>
              </svg>
            </button>
          </div>

          <div
            className="pp-gallery"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="pp-slide-track"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {gallery.map((src, i) => (
                <div className="pp-slide" key={i}>
                  <img src={src} alt={`${product.title} — photo ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {gallery.length > 1 && (
            <div className="pp-dots">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  className={`pp-dot ${i === activeIndex ? "active" : ""}`}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}

          <div className="pp-details">
            <h2 className="pp-title">{product.title}</h2>
            <p className="pp-price">${product.price}</p>
          </div>

          <button
            className={`pp-expand-btn ${expanded ? "open" : ""}`}
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Hide details" : "Show details"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          <div className={`pp-panel ${expanded ? "open" : ""}`}>
            <p className="pp-desc">{product.description}</p>
          </div>

          <div className="pp-spacer" />

          <button
            className="pp-cart-btn"
            onClick={handleCartClick}
            disabled={adding}
          >
            {adding ? "Adding…" : added ? "Buy Now" : "Add to Cart"}
          </button>
        </div>
      </div>
    </>
  );
}