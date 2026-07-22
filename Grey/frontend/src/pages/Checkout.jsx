import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { createOrder, verifyPayment } from "../services/orderService";
import { loadRazorpayScript } from "../services/loadRazorpay";
import "./Checkout.css";

export default function Checkout() {
  const { items, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const total = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
  const canSubmit = fullName && phone && address && items.length > 0 && !placing;

  const handlePay = async () => {
    setPlacing(true);
    setError("");

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Couldn't load the payment gateway. Check your connection and try again.");
        setPlacing(false);
        return;
      }

      const created = await createOrder({
        full_name: fullName,
        phone,
        email,
        address,
        notes,
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      });

      const options = {
        key: created.key_id,
        amount: created.amount,
        currency: created.currency,
        order_id: created.razorpay_order_id,
        name: "Grey",
        description: "Order Payment",
        prefill: { name: fullName, email, contact: phone },
        theme: { color: "#8a3a24" },
        handler: async (response) => {
          try {
            const verified = await verifyPayment({
              order_id: created.order_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setConfirmedOrder(verified);
            await clearCart();
          } catch (err) {
            console.error("Verification failed:", err.message);
            setError(
              "Payment could not be verified. If you were charged, contact us with your payment ID."
            );
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setPlacing(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Checkout error:", err.message);
      setError(
        err.response?.data?.detail || "Something went wrong starting checkout. Please try again."
      );
      setPlacing(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="checkout-page">
        <div className="checkout-confirm">
          <span className="checkout-eyebrow">Payment Successful</span>
          <h1 className="checkout-title">Order #{confirmedOrder.id} Confirmed.</h1>
          <p className="checkout-sub">
            We've received your payment and your order is being processed.
          </p>
          <button className="checkout-back-btn" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-head">
        <Link to="/cart" className="checkout-back">← Back to Cart</Link>
        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-sub">No account needed — pay securely with Razorpay.</p>
      </div>

      {items.length === 0 ? (
        <p className="checkout-empty">Your cart is empty.</p>
      ) : (
        <div className="checkout-grid">
          <div className="checkout-form">
            <div className="checkout-field">
              <label>Full Name *</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="checkout-field">
              <label>Phone Number *</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="checkout-field">
              <label>Email (for receipt)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="checkout-field">
              <label>Delivery Address *</label>
              <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="checkout-field">
              <label>Notes (optional)</label>
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            {error && <p className="checkout-error">{error}</p>}

            <button className="checkout-submit" onClick={handlePay} disabled={!canSubmit}>
              {placing ? "Processing…" : `Pay $${total.toFixed(2)}`}
            </button>
          </div>

          <div className="checkout-summary">
            <h3>Order Summary</h3>
            {items.map((i) => (
              <div className="checkout-summary-row" key={i.product.id}>
                <span>{i.quantity} × {i.product.title}</span>
                <span>${(Number(i.product.price) * i.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="checkout-summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}