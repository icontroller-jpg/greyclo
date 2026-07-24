import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";


function optimizeImage(url, width = 600) {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_fill/`);
}

function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const buy = async () => {
    if (product.soldOut || busy) return;
    setBusy(true);
    try {
      await addToCart(product, 1);
      navigate("/checkout");
    } catch (err) {
      console.error("Failed to add to cart:", err.message);
      alert("Couldn't add this to your cart. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <style>{`
        .pc {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--ivory, #f2ede4);
          position: relative;
          -webkit-tap-highlight-color: transparent;
        }

        .pc-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: #ece7de;
          flex-shrink: 0;
        }

        .pc-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        @media (hover: hover) {
          .pc:hover .pc-img-wrap img { transform: scale(1.04); }
        }

        .pc-sold-overlay {
          position: absolute;
          inset: 0;
          background: rgba(242,237,228,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pc-sold-label {
          font-family: 'Didact Gothic', sans-serif;
          font-size: 9px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #0e0d0b;
          border: 1px solid #0e0d0b;
          padding: 6px 14px;
        }

        .pc-info {
          padding: 12px 14px 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .pc-title {
          font-family: 'IM Fell English', serif;
          font-size: 14px;
          font-weight: 400;
          color: #0e0d0b;
          line-height: 1.3;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .pc-price {
          font-family: 'Didact Gothic', sans-serif;
          font-size: 10px;
          letter-spacing: 0.16em;
          color: rgba(14,13,11,0.5);
        }

        .pc-spacer { flex: 1; min-height: 10px; }

        .pc-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          width: 100%;
          min-height: 44px;
          padding: 12px 14px;
          margin-top: 10px;
          background: transparent;
          border: none;
          border-top: 1px solid rgba(14,13,11,0.1);
          cursor: pointer;
          font-family: 'Didact Gothic', sans-serif;
          font-size: 8.5px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(14,13,11,0.5);
          position: relative;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
          -webkit-text-size-adjust: 100%;
        }

        .pc-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .pc-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: #0e0d0b;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
          z-index: 0;
        }

        @media (hover: hover) {
          .pc-btn:hover::after { transform: translateY(0); }
          .pc-btn:hover { color: #f2ede4; }
        }

        .pc-btn:active::after { transform: translateY(0); }
        .pc-btn:active { color: #f2ede4; }

        .pc-btn span,
        .pc-btn svg { position: relative; z-index: 1; }

        .pc-cart-icon { width: 11px; height: 11px; flex-shrink: 0; }

        @media (max-width: 600px) {
          .pc-info  { padding: 10px 10px 0; }
          .pc-title { font-size: 12px; }
          .pc-price { font-size: 9px; }
          .pc-btn   {
            font-size: 8px;
            letter-spacing: 0.18em;
            padding: 10px;
            min-height: 40px;
          }
          .pc-cart-icon { width: 10px; height: 10px; }
        }

        @media (max-width: 375px) {
          .pc-title { font-size: 11px; }
          .pc-btn   { font-size: 7.5px; letter-spacing: 0.14em; }
        }
      `}</style>

      <div className="pc">
        <div className="pc-img-wrap">
          <img
            src={optimizeImage(product.image, 600)}
            alt={product.title}
            loading="lazy"
            decoding="async"
            width="600"
            height="600"
          />
          {product.soldOut && (
            <div className="pc-sold-overlay">
              <span className="pc-sold-label">Sold</span>
            </div>
          )}
        </div>

        <div className="pc-info">
          <h3 className="pc-title">{product.title}</h3>
          <p className="pc-price">${product.price}</p>
          <div className="pc-spacer" />
        </div>

        <button
          className="pc-btn"
          onClick={buy}
          disabled={product.soldOut || busy}
          aria-label={product.soldOut ? `${product.title} is sold out` : `Buy ${product.title} now`}
        >
          <svg className="pc-cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M6 6L4 3H2"/>
          </svg>
          <span>{product.soldOut ? "Sold Out" : busy ? "Adding…" : "Buy Now"}</span>
        </button>
      </div>
    </>
  );
}

export default ProductCard;