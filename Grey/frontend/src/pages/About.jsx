import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSiteImages } from "../services/siteImageService";
import "./About.css";

export default function About() {
  const [siteImages, setSiteImages] = useState({});

  useEffect(() => {
    getSiteImages().then(setSiteImages);
  }, []);

  return (
    <div className="about-page">
      <div className="about-head">
        <Link to="/" className="about-back">← Back to Home</Link>
        <span className="about-eyebrow">The Manifesto</span>
        <h1 className="about-title">Not For<br />Everyone.</h1>
      </div>

      <div
        className="about-hero-image"
        style={
          siteImages.about
            ? { backgroundImage: `url(${siteImages.about})`, backgroundSize: "cover", backgroundPosition: "center" }
            : {}
        }
      />

      <div className="about-body">
        <p className="about-lede">
          Grey was built for the ones who don't wait for permission.
        </p>
        <p>
          Every piece is made in limited numbers. No filler drops, no
          reissues, no restocks. When a piece sells out, it becomes part
          of the archive — not a line we run back next season.
        </p>
        <p>
          Drop 001 was designed and shot over three nights, with a crew of
          five and no studio. That's the pace we work at: small, deliberate,
          and always moving.
        </p>
        <p>
          We make garments for the street, not the runway. Washed cotton,
          heavyweight fleece, construction that holds up to actual wear.
          If it doesn't hold up, it doesn't ship.
        </p>
      </div>

      <div className="about-cta">
        <Link to="/shop" className="btn-primary">Shop the Drop</Link>
        <Link to="/journal" className="btn-ghost">Read the Journal →</Link>
      </div>
    </div>
  );
}