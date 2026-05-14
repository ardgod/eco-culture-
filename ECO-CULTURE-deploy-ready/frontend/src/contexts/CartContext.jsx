import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "ecoculture_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product_id === item.product_id && i.kind === item.kind);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: Number((next[idx].quantity + qty).toFixed(2)) };
        return next;
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const updateQty = (product_id, kind, qty) => {
    setItems((prev) =>
      prev
        .map((i) => (i.product_id === product_id && i.kind === kind ? { ...i, quantity: qty } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (product_id, kind) => {
    setItems((prev) => prev.filter((i) => !(i.product_id === product_id && i.kind === kind)));
  };

  const clear = () => setItems([]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clear, subtotal, totalQty }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
