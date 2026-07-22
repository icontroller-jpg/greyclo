import { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import "./Cart.css";

export default function Cart() {
  const { items, loading, updateQuantity, removeFromCart, isLoggedIn } = useContext(CartContext);

  const total = items.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0
  );

  return (
    <div className="cart-page">
      <div className="cart-head">
        <Link to="/" className="cart-back">← Continue Shopping</Link>
        <h1 className="cart-title">Your Cart</h1>
        {!isLoggedIn && (
          <p className="cart-guest-note">
            Shopping as a guest — <Link to="/login">sign in</Link> to save your cart across devices.
          </p>
        )}
      </div>

      {loading ? (
        <p className="cart-empty">Loading…</p>
      ) : items.length === 0 ? (
        <p className="cart-empty">No items yet.</p>
      ) : (
        <>
          <div className="cart-list">
            {items.map((item) => (
              <div className="cart-row" key={item.product.id}>
                <img src={item.product.image} alt={item.product.title} className="cart-img" />
                <div className="cart-row-info">
                  <p className="cart-row-title">{item.product.title}</p>
                  <p className="cart-row-price">${item.product.price}</p>
                </div>
                <div className="cart-qty">
                  <button onClick={() => updateQuantity(item, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item, item.quantity + 1)} aria-label="Increase quantity">+</button>
                </div>
                <button className="cart-remove" onClick={() => removeFromCart(item)}>Remove</button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <span>Total</span>
            <span className="cart-total">${total.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="cart-checkout-btn">Proceed to Checkout</Link>
        </>
      )}
    </div>
  );
}