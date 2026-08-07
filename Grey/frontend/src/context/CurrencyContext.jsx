import { createContext, useContext, useState, useMemo } from "react";

const CurrencyContext = createContext(null);

// Add/adjust currencies and rates as needed (rates relative to your base currency, e.g. USD)
const CURRENCIES = {
  USD: { symbol: "$", rate: 1, locale: "en-US" },
  EUR: { symbol: "€", rate: 0.92, locale: "de-DE" },
  GBP: { symbol: "£", rate: 0.78, locale: "en-GB" },
  INR: { symbol: "₹", rate: 83.2, locale: "en-IN" },
};

export function CurrencyProvider({ children, defaultCurrency = "INR" }) {
  const [currency, setCurrency] = useState(defaultCurrency);

  const value = useMemo(() => {
    const { locale, rate } = CURRENCIES[currency];

    const format = (price) => {
      const converted = Number(price) * rate;
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(converted);
    };

    return {
      currency,
      setCurrency,
      currencies: Object.keys(CURRENCIES),
      format,
    };
  }, [currency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}