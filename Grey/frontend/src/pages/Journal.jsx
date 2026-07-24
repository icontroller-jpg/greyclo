import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSiteImages } from "../services/siteImageService";
import "./Journal.css";

const ENTRIES = [
  {
    key: "campaign",
    tag: "Chapter 01",
    title: "Shot in the City That Never Asks.",
    excerpt:
      "Drop 001 was shot over three nights, no studio, no crew larger than five. Here's how it came together.",
  },
  {
    key: "process",
    tag: "Process",
    title: "Washed Cotton, Heavyweight Fleece.",
    excerpt:
      "Why we chose our base fabrics, and what goes into a piece before it ever reaches a rack.",
  },
  {
    key: "pack",
    tag: "The Pack",
    title: "Worn by the Street, Not the Studio.",
    excerpt:
      "A look at how the community shows up in Grey, in their own words and their own fits.",
  },
];

export default function Journal() {
  const [siteImages, setSiteImages] = useState({});

  useEffect(() => {
    getSiteImages().then(setSiteImages);
  }, []);

  return (
    <div className="journal-page">
      <div className="journal-head">
        <Link to="/" className="journal-back">← Back to Home</Link>
        <span className="journal-eyebrow">Notes From the Brand</span>
        <h1 className="journal-title">The<br />Journal.</h1>
      </div>

      <div className="journal-list">
        {ENTRIES.map((entry) => (
          <article className="journal-entry" key={entry.key}>
            <div
              className="journal-entry-visual"
              style={
                siteImages[entry.key]
                  ? {
                      backgroundImage: `url(${siteImages[entry.key]})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }
            />
            <div className="journal-entry-body">
              <span className="journal-entry-tag">{entry.tag}</span>
              <h2>{entry.title}</h2>
              <p>{entry.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}