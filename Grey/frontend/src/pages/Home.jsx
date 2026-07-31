import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import { getSiteImages } from "../services/siteImageService";
import { CATEGORIES } from "../constants/categories";
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

// How many category tiles show by default on mobile before "Load More"
const MOBILE_CATEGORY_LIMIT = 4;

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [siteImages, setSiteImages] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [garmentRotation, setGarmentRotation] = useState(0);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const dragState = useRef({ dragging: false, startX: 0, startRotation: 0 });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleGarmentTouchStart = (e) => {
    if (!isMobile) return;
    dragState.current = {
      dragging: true,
      startX: e.touches[0].clientX,
      startRotation: garmentRotation,
    };
  };

  const handleGarmentTouchMove = (e) => {
    if (!isMobile || !dragState.current.dragging) return;
    const deltaX = e.touches[0].clientX - dragState.current.startX;
    setGarmentRotation(dragState.current.startRotation + deltaX * 0.6);
  };

  const handleGarmentTouchEnd = () => {
    dragState.current.dragging = false;
  };

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

  // On mobile, show a capped set of categories until "Load More" is tapped.
  // Desktop/tablet always show the full list (CSS handles the 6-col grid there).
  const visibleCategories =
    isMobile && !showAllCategories
      ? CATEGORIES.slice(0, MOBILE_CATEGORY_LIMIT)
      : CATEGORIES;
  const hasMoreCategories = isMobile && CATEGORIES.length > MOBILE_CATEGORY_LIMIT;

  return (
    <>

{/* ── NAV ── */}
<header className={`site-header ${scrolled ? "scrolled" : ""}`}>
  <button
    className={`nav-hamburger ${menuOpen ? "open" : ""}`}
    onClick={() => setMenuOpen(!menuOpen)}
    aria-label="Toggle menu"
  >
    <span /><span /><span />
  </button>

  <nav className="nav-primary">
    <Link to="/shop">Shop</Link>
    <Link to="/collections">Collections</Link>
    <Link to="/journal">Journal</Link>
    <Link to="/about">About</Link>
  </nav>

  <span className="nav-logo">Grey</span>

  <div className="nav-icons">
    <Link to="/login" className="icon-btn" aria-label="Account">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>
    </Link>
    <Link to="/cart" className="icon-btn" aria-label="Cart">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M6 6L4 3H2"/></svg>
    </Link>
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
  <div className="hero-text">
    <span className="hero-line">Jay Z 1996</span>
    <span className="hero-line">Alkaline 2016</span>
    <span className="hero-line">Grey 2026</span>
  </div>

  <div className="scroll-cue">Scroll</div>
</section>

      {/* ── BRAND STATEMENT ── */}

{/* ── DROP EVENT: current collection, image-only ── */}
<section className="drop-event" id="collections">
  <div className="section-head center-head">
    <span className="section-eyebrow center">Collection One</span>
  </div>

<div className="drop-grid-imgs">
  <Link
    to={products[0] ? `/product/${products[0].id}` : "#shop"}
    className="drop-visual-img"
    style={bgStyle(products[0] ? products[0].image : siteImages.drop)}
  />
  <Link
    to={products[1] ? `/product/${products[1].id}` : "#shop"}
    className="drop-visual-img drop-visual-img--secondary"
    style={bgStyle(products[1] ? products[1].image : siteImages.campaign)}
  />
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