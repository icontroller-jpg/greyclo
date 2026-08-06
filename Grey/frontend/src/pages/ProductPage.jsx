import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import { getProduct } from "../services/productService";
import { CartContext } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { format } = useCurrency();
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const galleryRef = useRef(null);

  useEffect(() => {
    setAdded(false);
    setActiveIndex(0);
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

  const onGalleryScroll = () => {
    const el = galleryRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  };

  return (
    <>
      <style>{`
        :root {
          --black: #0b0b0c;
          --charcoal: #16171a;
          --off-white: #f5f4f1;
          --concrete: #8a8a86;
          --washed: #b9b8b3;
          --line: rgba(245,244,241,0.12);
          --rust: #b4542f;
          --rust-dim: #8f4326;
          --ease: cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pp-page {
          min-height: 100vh;
          background: var(--black);
        }

        .pp-wrap {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          min-height: 100vh;
        }

        .pp-topbar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px;
          z-index: 2;
        }

        .pp-icon-btn {
          background: rgba(11,11,12,0.35);
          backdrop-filter: blur(4px);
          border: 1px solid var(--line);
          border-radius: 999px;
          width: 38px;
          height: 38px;
          padding: 0;
          cursor: pointer;
          color: var(--off-white);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.2s var(--ease);
        }
        .pp-icon-btn:hover { border-color: var(--off-white); }

        .pp-gallery-col {
          position: relative;
          background: var(--charcoal);
          border-right: 1px solid var(--line);
        }

        .pp-gallery {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          height: 100%;
          min-height: 100vh;
        }
        .pp-gallery::-webkit-scrollbar { display: none; }

        .pp-slide {
          flex: 0 0 100%;
          scroll-snap-align: start;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pp-slide img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .pp-dots {
          position: absolute;
          bottom: 24px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          gap: 7px;
        }

        .pp-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(245,244,241,0.3);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background 0.2s var(--ease), transform 0.2s var(--ease);
        }
        .pp-dot.active {
          background: var(--off-white);
          transform: scale(1.5);
        }

        .pp-info {
          padding: 64px 56px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .pp-tag {
          display: inline-block;
          align-self: flex-start;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--concrete);
          border: 1px solid var(--line);
          padding: 6px 12px;
          margin-bottom: 20px;
        }

        .pp-title {
          font-family: 'Anton', sans-serif;
          text-transform: uppercase;
          font-size: clamp(32px, 4vw, 52px);
          line-height: 1;
          color: var(--off-white);
          margin: 0 0 18px;
        }

        .pp-price {
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px;
          letter-spacing: 0.04em;
          color: var(--off-white);
          margin: 0 0 28px;
        }

        .pp-desc {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          line-height: 1.75;
          color: var(--washed);
          max-width: 440px;
          margin: 0 0 40px;
        }

        .pp-cart-btn {
          align-self: flex-start;
          background: var(--off-white);
          color: var(--black);
          padding: 16px 38px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          border: 1px solid var(--off-white);
          cursor: pointer;
          transition: background 0.3s var(--ease), color 0.3s var(--ease), border-color 0.3s var(--ease);
        }
        .pp-cart-btn:hover { background: transparent; color: var(--off-white); }

        .pp-cart-btn.added {
          background: var(--rust);
          border-color: var(--rust);
          color: var(--off-white);
        }
        .pp-cart-btn.added:hover { background: var(--rust-dim); border-color: var(--rust-dim); }

        .pp-cart-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .pp-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--black);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--concrete);
        }

        @media (max-width: 900px) {
          .pp-wrap { grid-template-columns: 1fr; }
          .pp-gallery-col { border-right: none; border-bottom: 1px solid var(--line); }
          .pp-gallery { min-height: 60vh; }
          .pp-info { padding: 40px 24px; }
        }
      `}</style>

      <div className="pp-page">
        <div className="pp-wrap">
          <div className="pp-gallery-col">
            <div className="pp-topbar">
              <button className="pp-icon-btn" onClick={() => navigate(-1)} aria-label="Back">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button className="pp-icon-btn" onClick={() => navigate("/cart")} aria-label="Cart">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M6 6L4 3H2"/>
                </svg>
              </button>
            </div>

            <div className="pp-gallery" ref={galleryRef} onScroll={onGalleryScroll}>
              {gallery.map((src, i) => (
                <div className="pp-slide" key={i}>
                  <img src={src} alt={`${product.title} — photo ${i + 1}`} />
                </div>
              ))}
            </div>

            {gallery.length > 1 && (
              <div className="pp-dots">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    className={`pp-dot ${i === activeIndex ? "active" : ""}`}
                    onClick={() => {
                      const el = galleryRef.current;
                      if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
                    }}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="pp-info">
            {product.category && <span className="pp-tag">{product.category}</span>}
            <h1 className="pp-title">{product.title}</h1>
            <p className="pp-price">{format(product.price)}</p>
            {product.description && <p className="pp-desc">{product.description}</p>}

            <button
              className={`pp-cart-btn ${added ? "added" : ""}`}
              onClick={handleCartClick}
              disabled={adding}
            >
              {adding ? "Adding…" : added ? "Buy Now" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}