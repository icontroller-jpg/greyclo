import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/signup/`,
        { email, password }
      );
      navigate("/login");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(err.response.data.detail || "Signup failed");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="su-root">
      <Link to="/" className="su-logo">Grey</Link>

      <div className="su-card">
        <span className="su-eyebrow">Join the Circle</span>
        <h1 className="su-heading">Create an Account.</h1>
        <p className="su-sub">First access. Limited drops. No noise.</p>
        <div className="su-divider" />

        <div className={`su-field ${focused === "email" ? "active" : ""}`}>
          <label className="su-label">Email Address</label>
          <input
            type="email"
            className="su-input"
            value={email}
            autoComplete="email"
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
          />
        </div>

        <div className={`su-field ${focused === "password" ? "active" : ""}`}>
          <label className="su-label">Password</label>
          <input
            type="password"
            className="su-input"
            value={password}
            autoComplete="new-password"
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
          />
        </div>

        {error && <div className="su-error">{error}</div>}

        <button
          className="su-btn"
          onClick={handleSignup}
          disabled={loading || !email || !password}
        >
          <span>{loading ? "Creating…" : "Create Account"}</span>
        </button>

        <p className="su-footer-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;