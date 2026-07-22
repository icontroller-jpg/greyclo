import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Didact+Gothic&display=swap');

        .li-root {
          min-height: 100vh;
          min-height: 100dvh;
          background: var(--ivory, #f2ede4);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          font-family: 'Didact Gothic', sans-serif;
        }

        .li-logo {
          font-family: 'IM Fell English', serif;
          font-size: 13px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #0e0d0b;
          margin-bottom: 48px;
        }

        .li-card {
          width: 100%;
          max-width: 360px;
        }

        .li-heading {
          font-family: 'IM Fell English', serif;
          font-size: 36px;
          color: #0e0d0b;
        }

        .li-heading-italic {
          font-style: italic;
          color: rgba(14,13,11,0.4);
        }

        .li-sub {
          font-size: 9px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(14,13,11,0.4);
          margin-bottom: 36px;
          margin-top: 10px;
        }

        .li-divider {
          width: 100%;
          height: 1px;
          background: rgba(14,13,11,0.1);
          margin-bottom: 28px;
        }

        .li-field {
          margin-bottom: 20px;
          position: relative;
        }

        .li-label {
          display: block;
          font-size: 8.5px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(14,13,11,0.35);
          margin-bottom: 8px;
        }

        .li-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(14,13,11,0.15);
          color: #0e0d0b;
          font-size: 13px;
          padding: 8px 0;
          outline: none;
        }

        .li-input:focus {
          border-bottom-color: #0e0d0b;
        }

        .li-btn {
          width: 100%;
          margin-top: 32px;
          padding: 14px;
          background: transparent;
          border: 1px solid #0e0d0b;
          color: #0e0d0b;
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .li-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .li-error {
          color: #b00020;
          font-size: 12px;
          margin-bottom: 10px;
        }

        .li-footer-text {
          margin-top: 20px;
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(14,13,11,0.35);
          text-align: center;
        }

      `}</style>

      <div className="li-root">
        <span className="li-logo">Pridepzw</span>

        <div className="li-card">
          <h1 className="li-heading">
            Welcome<br />
            <span className="li-heading-italic">back</span>
          </h1>

          <p className="li-sub">Sign in to your account</p>
          <div className="li-divider" />

          <div className="li-field">
            <label className="li-label">Email Address</label>
            <input
              type="email"
              className="li-input"
              value={email}
              autoComplete="email"
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />
          </div>

          <div className="li-field">
            <label className="li-label">Password</label>
            <input
              type="password"
              className="li-input"
              value={password}
              autoComplete="current-password"
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
          </div>

          {error && <div className="li-error">{error}</div>}

          <button
            className="li-btn"
            onClick={handleLogin}
            disabled={loading || !email || !password}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="li-footer-text">
            No account yet? <a href="/#/signup">Create one</a>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;