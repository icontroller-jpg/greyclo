import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { getCart, addCartItem, updateCartItem, removeCartItem } from "../services/cartService.js";

export const CartContext = createContext();

const GUEST_KEY = "guestCart";

function loadGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY)) || [];
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
}

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user;

  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshServerCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCart();
      setRawItems(data);
    } catch (err) {
      console.error("Failed to load cart:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Whenever login state changes: if someone just logged in and had guest
  // items sitting in localStorage, push each one to the server cart (this
  // is what "keep records of the user's cart if signed in" means in
  // practice), then switch to reading from the server from now on.
  useEffect(() => {
    const sync = async () => {
      if (isLoggedIn) {
        const guest = loadGuestCart();
        if (guest.length > 0) {
          for (const g of guest) {
            try {
              await addCartItem(g.product.id, g.quantity);
            } catch (err) {
              console.error("Failed to merge guest cart item:", err.message);
            }
          }
          localStorage.removeItem(GUEST_KEY);
        }
        refreshServerCart();
      } else {
        setRawItems(loadGuestCart());
      }
    };
    sync();
  }, [isLoggedIn, refreshServerCart]);

  const addToCart = async (product, quantity = 1) => {
    if (isLoggedIn) {
      await addCartItem(product.id, quantity);
      await refreshServerCart();
    } else {
      setRawItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        const next = existing
          ? prev.map((i) =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
            )
          : [...prev, { product, quantity }];
        saveGuestCart(next);
        return next;
      });
    }
  };

  const removeFromCart = async (item) => {
    if (isLoggedIn) {
      await removeCartItem(item.id);
      await refreshServerCart();
    } else {
      setRawItems((prev) => {
        const next = prev.filter((i) => i.product.id !== item.product.id);
        saveGuestCart(next);
        return next;
      });
    }
  };

  const updateQuantity = async (item, quantity) => {
    if (quantity < 1) return removeFromCart(item);
    if (isLoggedIn) {
      await updateCartItem(item.id, quantity);
      await refreshServerCart();
    } else {
      setRawItems((prev) => {
        const next = prev.map((i) =>
          i.product.id === item.product.id ? { ...i, quantity } : i
        );
        saveGuestCart(next);
        return next;
      });
    }
  };

  const clearCart = async () => {
    if (isLoggedIn) {
      for (const item of items) {
        try {
          await removeCartItem(item.id);
        } catch (err) {
          console.error("Failed to clear cart item:", err.message);
        }
      }
      await refreshServerCart();
    } else {
      setRawItems([]);
      saveGuestCart([]);
    }
  };

  // Server items look like { id, product_detail, quantity }.
  // Guest items look like { product, quantity }.
  // Normalize both into one consistent shape for anything reading the cart.
  const items = rawItems.map((i) => ({
    id: i.id ?? null,
    product: i.product_detail ?? i.product,
    quantity: i.quantity,
  }));

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, loading, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, isLoggedIn }}
    >
      {children}
    </CartContext.Provider>
  );
};