import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";

export default function Shop() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then((data) => setProducts(data || []));
  }, []);

  return (
    <>
      <style>{`
        .shop-page {
          padding: 24px 16px 60px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .shop-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(14,13,11,0.08);
        }

        @media (max-width: 900px) {
          .shop-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 600px) {
          .shop-grid { grid-template-columns: repeat(2, 1fr); gap: 1px; }
        }
      `}</style>

      <div className="shop-page">
        <div className="shop-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </>
  );
}