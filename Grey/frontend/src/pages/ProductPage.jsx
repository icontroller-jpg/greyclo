import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
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

  return (
    <>
      <style>{`
        .pp-wrap {
          display: flex;
          min-height: 100vh;
          background: #0e0d0b;
        }

        .pp-gallery {
          position: sticky;
          top: 0;
          height: 100vh;
          width: 50%;
          display: flex;
          flex-direction: column;
        }

        .pp-main-img {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: #0e0d0b;
        }

        .pp-main-img img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .pp-nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(242,237,228,0.1);
          border: none;
          color: #f2ede4;
          width: 40px;
          height: 40px;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pp-nav-arrow:hover { background: rgba(242,237,228,0.2); }
        .pp-nav-prev { left: 12px; }
        .pp-nav-next { right: 12px; }

        .pp-thumbs {
          display: flex;
          gap: 8px;
          padding: 12px;
          overflow-x: auto;
        }

        .pp-thumb {
          width: 56px;
          height: 56px;
          flex-shrink: 0;
          cursor: pointer;
          opacity: 0.5;
          border: 1px solid transparent;
          background: #1a1815;
        }

        .pp-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .pp-thumb.active {
          opacity: 1;
          border-color: #f2ede4;
        }

        .pp-info {
          width: 50%;
          padding: 60px 60px 0;
          color: #f2ede4;
          font-family: 'Didact Gothic', sans-serif;
        }

        .pp-title {
          font-family: 'IM Fell English', serif;
          font-weight: 400;
          font-size: 48px;
          margin: 0 0 16px;
        }

        .pp-price {
          font-size: 20px;
          margin: 0 0 24px;
        }

        .pp-desc {
          font-size: 13px;
          line-height: 1.6;
          color: rgba(242,237,228,0.7);
          margin-bottom: 32px;
        }

        .pp-cart-btn {
          background: #f2ede4;
          color: #0e0d0b;
          border: none;
          padding: 16px 32px;
          font-family: 'Didact Gothic', sans-serif;
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .pp-cart-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .pp-cart-btn.added { background: #d8cfbd; }

        @media (max-width: 800px) {
          .pp-wrap { flex-direction: column; }
          .pp-gallery, .pp-info { width: 100%; }
          .pp-gallery { position: relative; height: auto; }
          .pp-main-img { aspect-ratio: 1 / 1; }
          .pp-info { padding: 30px 20px; }
          .pp-title { font-size: 32px; }
        }
      `}</style>

      <div className="pp-wrap">
        <div className="pp-gallery">
          <div className="pp-main-img">
            <img src={gallery[activeIndex]} alt={`${product.title} — photo ${activeIndex + 1}`} />
            {gallery.length > 1 && (
              <>
                <button
                  className="pp-nav-arrow pp-nav-prev"
                  onClick={() => setActiveIndex((i) => (i === 0 ? gallery.length - 1 : i - 1))}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  className="pp-nav-arrow pp-nav-next"
                  onClick={() => setActiveIndex((i) => (i === gallery.length - 1 ? 0 : i + 1))}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="pp-thumbs">
              {gallery.map((src, i) => (
                <div
                  key={i}
                  className={`pp-thumb ${i === activeIndex ? "active" : ""}`}
                  onClick={() => setActiveIndex(i)}
                >
                  <img src={src} alt={`Thumbnail ${i + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pp-info">
          <h2 className="pp-title">{product.title}</h2>
          <p className="pp-price">${product.price}</p>
          <p className="pp-desc">{product.description}</p>

          <button
            className={`pp-cart-btn ${added ? "added" : ""}`}
            onClick={handleCartClick}
            disabled={adding}
          >
            {adding ? "Adding…" : added ? "Buy Now →" : "Add to Cart"}
          </button>
        </div>
      </div>
    </>
  );
}