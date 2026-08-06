import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import { getProduct } from "../services/productService";
import { CartContext } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import "./ProductPage.css";

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

  const scrollToIndex = (i) => {
    const el = galleryRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
    setActiveIndex(i);
  };

  const onGalleryScroll = () => {
    const el = galleryRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== activeIndex) setActiveIndex(i);
  };

  return (
    <div className="pp-wrap">
      {/* ── GALLERY (left column) ── */}
      <div className="pp-gallery" ref={galleryRef} onScroll={onGalleryScroll}>
        {gallery.map((src, i) => (
          <div className="pp-slide" key={i}>
            <img src={src} alt={`${product.title} — photo ${i + 1}`} />
          </div>
        ))}

        <div className="pp-topbar">
          <button className="pp-icon-btn" onClick={() => navigate(-1)} aria-label="Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button className="pp-icon-btn" onClick={() => navigate("/cart")} aria-label="Cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6h15l-1.5 9h-12z" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M6 6L4 3H2" />
            </svg>
          </button>
        </div>

        {gallery.length > 1 && (
          <div className="pp-dots">
            {gallery.map((_, i) => (
              <button
                key={i}
                className={`pp-dot ${i === activeIndex ? "active" : ""}`}
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── INFO (right column) ── */}
      <div className="pp-info">
        {product.sku && <span className="pp-tag">{product.sku}</span>}
        <h1 className="pp-title">{product.title}</h1>
        <div className="pp-price">{format(product.price)}</div>
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
  );
}