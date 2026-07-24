import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/login/`,
        {
          username: email,
          password: password
        }
      );

      login(res.data.access, res.data.refresh);

      navigate("/");
    } catch (err) {
      console.error(err);

      if (err.response && err.response.data) {
        setError(err.response.data.detail || "Login failed");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg-root">
      <Link to="/" className="lg-logo">Grey</Link>

      <div className="lg-card">
        <span className="lg-eyebrow">Account Access</span>
        <h1 className="lg-heading">Welcome Back.</h1>
        <p className="lg-sub">Sign in to continue</p>
        <div className="lg-divider" />

        <div className={`lg-field ${focused === "email" ? "active" : ""}`}>
          <label className="lg-label">Email Address</label>
          <input
            type="email"
            className="lg-input"
            value={email}
            autoComplete="email"
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className={`lg-field ${focused === "password" ? "active" : ""}`}>
          <label className="lg-label">Password</label>
          <input
            type="password"
            className="lg-input"
            value={password}
            autoComplete="current-password"
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
        </div>

        {error && <div className="lg-error">{error}</div>}

        <button
          className="lg-btn"
          onClick={handleLogin}
          disabled={loading || !email || !password}
        >
          {loading ? "Signing In…" : "Sign In"}
        </button>

        <p className="lg-footer-text">
          No account yet? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;