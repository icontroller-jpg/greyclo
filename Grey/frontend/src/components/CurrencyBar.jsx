import { useEffect, useRef, useState } from "react";
import { CURRENCIES, useCurrency } from "../context/CurrencyContext";

function useScrollHide() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;

      // Ignore tiny jitters (mobile bounce, trackpad noise)
      if (Math.abs(delta) < 6) return;

      // Always show near the very top, regardless of direction
      if (y < 80) {
        setHidden(false);
      } else if (delta > 0) {
        setHidden(true); // scrolling down → hide
      } else {
        setHidden(false); // scrolling up → show
      }

      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}

export default function CurrencyBar() {
  const hidden = useScrollHide();
  const { currency, setCurrency } = useCurrency();

  return (
    <>
      <style>{`
        .cb-bar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 40;
          background: #111;
          border-top: 1px solid rgba(255,255,255,0.08);
          transform: translateY(0);
          transition: transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94);
        }

        .cb-bar.hidden {
          transform: translateY(100%);
        }

        .cb-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 10px 16px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .cb-inner::-webkit-scrollbar { display: none; }

        .cb-option {
          flex-shrink: 0;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Didact Gothic', sans-serif;
          font-size: 11px;
          letter-spacing: 0.08em;
          padding: 6px 12px;
          border-radius: 999px;
          color: rgba(242,237,228,0.45);
          transition: color 0.2s, background 0.2s;
        }

        .cb-option.active {
          color: #0e0d0b;
          background: #f2ede4;
        }
      `}</style>

      <div className={`cb-bar ${hidden ? "hidden" : ""}`}>
        <div className="cb-inner">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              className={`cb-option ${currency.code === c.code ? "active" : ""}`}
              onClick={() => setCurrency(c)}
            >
              {c.symbol} {c.code}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}