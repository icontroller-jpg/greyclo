import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import { getSiteImages } from "../services/siteImageService";
import "./Home.css";

// Builds a background-image style, falling back to `undefined` (letting the
// CSS class's placeholder texture show) when no image has been uploaded yet.
function bgStyle(url, overlay) {
  if (!url) return {};
  return {
    backgroundImage: overlay ? `${overlay}, url(${url})` : `url(${url})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

// TODO: set this to your real next drop date/time
const NEXT_DROP_DATE = new Date("2026-09-01T10:00:00");

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [siteImages, setSiteImages] = useState({});

  useEffect(() => {
    loadProducts();
    getSiteImages().then(setSiteImages);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, NEXT_DROP_DATE - new Date());
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  return (
    <>
      {/* ── ANNOUNCEMENT BAR ── */}
      <div className="announce">
        <div className="announce-track">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="announce-group">
              <span className="announce-item">Drop 001 — Limited Release</span>
              <span className="announce-item">Join the List</span>
              <span className="announce-item">No Restocks</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── NAV ── */}
      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <span className="nav-logo">Grey</span>
        <nav className="nav-primary">
          <Link to="/shop">Shop</Link>
          <Link to="/collections">Collections</Link>
          <Link to="/journal">Journal</Link>
          <Link to="/about">About</Link>
        </nav>
        <div className="nav-icons">

          <Link to="/login" className="icon-btn" aria-label="Account">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>
          </Link>

          <Link to="/cart" className="icon-btn" aria-label="Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M6 6L4 3H2"/></svg>
          </Link>
          <button
            className={`nav-hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <a className="mobile-menu-link" href="#shop" onClick={() => setMenuOpen(false)}>Shop</a>
        <a className="mobile-menu-link" href="#collections" onClick={() => setMenuOpen(false)}>Collections</a>
        <a className="mobile-menu-link" href="#journal" onClick={() => setMenuOpen(false)}>Journal</a>
        <a className="mobile-menu-link" href="#about" onClick={() => setMenuOpen(false)}>About</a>
      </div>

      {/* ── HERO ── */}
      <section
        className="hero"
        style={bgStyle(
          siteImages.hero,
          "linear-gradient(180deg, rgba(10,10,10,0.12) 0%, rgba(10,10,10,0.05) 40%, rgba(10,10,10,0.92) 100%)"
        )}
      >
        <div className="hero-grain" />
        {!siteImages.hero && <div className="hero-figure" />}
        <p className="hero-eyebrow"><span className="hero-dot" /> Drop 001 — Available Now</p>
        <h1 className="hero-title">
          Not For<br /><span className="hero-title-stroke">Everyone.</span>
        </h1>
        <p className="hero-sub">
          Built for the ones who don't wait for permission. Made in limited numbers.
          Once they're gone, they don't come back.
        </p>
        <div className="hero-cta-row">
          <a href="#shop" className="btn-primary">Shop the Drop</a>
          <a href="#about" className="btn-ghost">Read the Manifesto</a>
        </div>
        <div className="scroll-cue">Scroll</div>
      </section>

      {/* ── BRAND STATEMENT ── */}
      <section className="statement">
        <p>
          BUILT FOR THOSE WHO MOVE DIFFERENT.{" "}
          <span className="statement-fade">MADE IN LIMITED NUMBERS,</span>{" "}
          WORN WITHOUT PERMISSION.
        </p>
      </section>

      {/* ── DROP EVENT: most recently posted product ── */}
      <section className="drop-event" id="collections">
        <div className="section-head">
          <div>
            <span className="section-eyebrow">The Current Drop</span>
            <h2 className="section-title">Every Piece Is<br />a Small Riot.</h2>
          </div>
          <a href="#shop" className="btn-ghost">View Full Collection →</a>
        </div>
        {products.length > 0 ? (
          <div className="drop-grid">
            <div className="drop-visual" style={bgStyle(products[0].image)}>
              <span className="drop-tag">{products[0].category}</span>
            </div>
            <div className="drop-info">
              <span className="drop-num">Latest Drop</span>
              <h3>{products[0].title}</h3>
              <p className="drop-desc">{products[0].description}</p>
              <div className="drop-meta">
                <div><span className="drop-label">Price</span><span className="drop-value">${products[0].price}</span></div>
                <div>
                  <span className="drop-label">Status</span>
                  <span className="drop-value">
                    {products[0].status === "sold" ? "Sold" : "Available Now"}
                  </span>
                </div>
              </div>
              <Link to={`/product/${products[0].id}`} className="btn-primary">
                Shop This Piece
              </Link>
            </div>
          </div>
        ) : (
          <div className="drop-grid">
            <div className="drop-visual" style={bgStyle(siteImages.drop)}>
              <span className="drop-tag">Coming Soon</span>
            </div>
            <div className="drop-info">
              <span className="drop-num">001</span>
              <h3>The First Statement</h3>
              <p className="drop-desc">
                Built from washed cotton and heavyweight fleece — no filler pieces, no reissues.
                When it's gone, it's part of the archive.
              </p>
              <a href="#shop" className="btn-primary">Shop the Range</a>
            </div>
          </div>
        )}
      </section>


      {/* ── SHOP BY CATEGORY ── */}
      <section className="shop-section" id="shop">
        <div className="section-head">
          <div>
            <span className="section-eyebrow">Shop by Category</span>
            <h2 className="section-title">The Full Range.</h2>
          </div>
          <div className="shop-count">{products.length} pieces total</div>
        </div>

        <div className="category-grid">
          <Link
            to="/collection/shirts"
            className="category-tile"
            style={bgStyle(siteImages["category-shirts"])}
          >
            <span className="category-label">Shirts</span>
          </Link>
          <Link
            to="/collection/jackets"
            className="category-tile"
            style={bgStyle(siteImages["category-jackets"])}
          >
            <span className="category-label">Jackets</span>
          </Link>
          <Link
            to="/collection/bottoms"
            className="category-tile"
            style={bgStyle(siteImages["category-bottoms"])}
          >
            <span className="category-label">Bottoms</span>
          </Link>
        </div>
      </section>

      {/* ── SHOP THE LOOK ── */}
      <section className="look-section">
        <div className="section-head">
          <div>
            <span className="section-eyebrow">Complete Fits</span>
            <h2 className="section-title">Shop the Look.</h2>
          </div>
        </div>
        <div className="look-scroller">
          <div className="look-card" style={bgStyle(siteImages["look-0"])}><span className="look-label">Fit 01</span></div>
          <div className="look-card" style={bgStyle(siteImages["look-1"])}><span className="look-label">Fit 02</span></div>
          <div className="look-card" style={bgStyle(siteImages["look-2"])}><span className="look-label">Fit 03</span></div>
        </div>
      </section>

      {/* ── CAMPAIGN ── */}
      <section className="campaign-wrap" id="journal">
        <div
          className="campaign"
          style={bgStyle(
            siteImages.campaign,
            "linear-gradient(0deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.1) 55%)"
          )}
        >
          <div className="campaign-content">
            <span className="section-eyebrow light">Campaign — Chapter 01</span>
            <h3>Shot in the City<br />That Never Asks.</h3>
            <p>Drop 001 was shot over three nights, no studio, no crew larger than five.</p>
            <a href="#journal" className="btn-primary">Explore the Campaign</a>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY ── */}
      <section className="community-section">
        <div className="section-head">
          <div>
            <span className="section-eyebrow">The Pack</span>
            <h2 className="section-title">Worn by the Street,<br />Not the Studio.</h2>
          </div>
          <span className="community-cta">#WearGrey</span>
        </div>
        <div className="community-grid">
          {[...Array(8)].map((_, i) => (
            <div className="community-cell" key={i} style={bgStyle(siteImages[`community-${i}`])} />
          ))}
        </div>
      </section>

      {/* ── COUNTDOWN ── */}
      <section className="countdown-section" id="about">
        <span className="section-eyebrow center">Drop 002</span>
        <h3 className="countdown-title">Next Release Counts Down.</h3>
        <div className="timer">
          <div className="timer-cell"><span className="timer-num">{pad(timeLeft.d)}</span><span className="timer-lbl">Days</span></div>
          <div className="timer-cell"><span className="timer-num">{pad(timeLeft.h)}</span><span className="timer-lbl">Hrs</span></div>
          <div className="timer-cell"><span className="timer-num">{pad(timeLeft.m)}</span><span className="timer-lbl">Min</span></div>
          <div className="timer-cell"><span className="timer-num">{pad(timeLeft.s)}</span><span className="timer-lbl">Sec</span></div>
        </div>
        <form className="notify-form" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Enter your email" aria-label="Email for drop notification" />
          <button type="submit">Notify Me</button>
        </form>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="newsletter">
        <h3>Enter the<br />Circle.</h3>
        <p>First access. Limited drops. No noise.</p>
        <form className="notify-form" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Enter your email" aria-label="Email signup" />
          <button type="submit">Join</button>
        </form>
      </section>

      {/* ── FOOTER ── */}
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">Grey</div>
            <p>A garment company operating in limited numbers. No restocks, no permission asked.</p>
          </div>
          <div className="footer-col">
            <h5>Shop</h5>
            <ul>
              <li><a href="#shop">New Arrivals</a></li>
              <li><a href="#collections">Latest Drop</a></li>
              <li><a href="#">Outerwear</a></li>
              <li><a href="#">Accessories</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Brand</h5>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#journal">Journal</a></li>
              <li><a href="#journal">Campaigns</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Support</h5>
            <ul>
              <li><a href="#">Shipping</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">Size Guide</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Grey. All rights reserved.</span>
          <span>Designed for those who move different.</span>
        </div>
      </footer>
    </>
  );
}