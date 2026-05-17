import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { useData } from "./DataContext.jsx";
import api from "../../services/api.js";
import { toast } from "sonner";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { products } = useData();

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);

  // Load guest cart from localStorage
  useEffect(() => {
    if (!user) {
      try {
        const localCart = localStorage.getItem("cart");
        const localWishlist = localStorage.getItem("wishlist");
        if (localCart) setCart(JSON.parse(localCart));
        if (localWishlist) setWishlist(JSON.parse(localWishlist));
      } catch {}
    }
  }, [user]);

  // Load server cart/wishlist when user logs in
  useEffect(() => {
    if (!user) return;

    const localCartStr = localStorage.getItem("cart");
    const localCart = localCartStr ? JSON.parse(localCartStr) : [];

    Promise.all([
      api.get("/cart").then((r) => r.data),
      api.get("/wishlist").then((r) => r.data),
    ]).then(async ([serverCart, serverWishlist]) => {
      // Merge local guest cart into server cart
      for (const item of localCart) {
        const exists = serverCart.find(
          (c) => c.productId === item.productId && c.color === (item.color || "")
        );
        if (!exists) {
          try {
            await api.post("/cart", { productId: item.productId, quantity: item.quantity, color: item.color });
            serverCart.push(item);
          } catch {}
        }
      }
      if (localCartStr) localStorage.removeItem("cart");

      setCart(serverCart);
      setWishlist(serverWishlist);
    }).catch(console.error);
  }, [user]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(cart));
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [cart, wishlist, user]);

  // Cart total
  useEffect(() => {
    let total = 0;
    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) total += product.price * item.quantity;
    });
    setCartTotal(total);
  }, [cart, products]);

  const addToCart = async (productId, quantity = 1, color) => {
    const idx = cart.findIndex(
      (i) => i.productId === productId && i.color === (color || null)
    );
    let newCart = [...cart];

    if (idx >= 0) {
      newCart[idx] = { ...newCart[idx], quantity: newCart[idx].quantity + quantity };
    } else {
      newCart.push({ productId, quantity, addedAt: new Date().toISOString(), color: color ?? null });
    }

    setCart(newCart);
    setIsCartOpen(true);
    toast.success("Added to cart");

    if (user) {
      try {
        const res = await api.post("/cart", { productId, quantity, color: color || "" });
        setCart(res.data);
      } catch {}
    }
  };

  const removeFromCart = async (productId, color) => {
    setCart(cart.filter((i) => !(i.productId === productId && i.color === (color ?? null))));

    if (user) {
      try {
        await api.delete(`/cart/${productId}`, { params: { color: color || "" } });
      } catch {}
    }
  };

  const updateQuantity = async (productId, quantity, color) => {
    if (quantity < 1) return;

    setCart(cart.map((i) =>
      i.productId === productId && i.color === (color ?? null) ? { ...i, quantity } : i
    ));

    if (user) {
      try {
        await api.put(`/cart/${productId}`, { quantity, color: color || "" });
      } catch {}
    }
  };

  const clearCart = async () => {
    setCart([]);
    if (user) {
      try { await api.delete("/cart/clear"); } catch {}
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      // Guest: localStorage wishlist
      const exists = wishlist.includes(productId);
      const newList = exists
        ? wishlist.filter((id) => id !== productId)
        : [...wishlist, productId];
      setWishlist(newList);
      if (!exists) toast.success("Added to wishlist");
      return;
    }

    const exists = wishlist.includes(productId);

    if (exists) {
      setWishlist(wishlist.filter((id) => id !== productId));
      try { await api.delete(`/wishlist/${productId}`); } catch {}
    } else {
      setWishlist([...wishlist, productId]);
      toast.success("Added to wishlist");
      try { await api.post(`/wishlist/${productId}`); } catch {}
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isCartOpen,
        setIsCartOpen,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
