import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { getProduct } from "../services/productService";
import { CartContext } from "../context/CartContext";
import "./ProductPage.css";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setAdded(false);
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    const data = await getProduct(id);
    setProduct(data);
  };

  if (!product) return <p className="pp-loading">Loading…</p>;

  // Gallery images come from the ProductImage model (product.images).
  // Older products created before multi-image support won't have any, so
  // fall back to the single cover image in that case.
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
    <div className="pp-wrap">
      <div className="pp-gallery">
        {gallery.map((src, i) => (
          <div className="pp-slide" key={i}>
            <img src={src} alt={`${product.title} — photo ${i + 1}`} />
          </div>
        ))}
      </div>

      <div className="pp-info">
        {gallery.length > 1 && (
          <span className="pp-tag">{gallery.length} Photos — Scroll to View</span>
        )}
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
  );
}