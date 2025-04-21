import React, { createContext, useState, useEffect } from "react";

// Create the CartContext
export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [vendorId, setVendorId] = useState(localStorage.getItem("vendorId") || null);
  const [priceType, setPriceType] = useState(localStorage.getItem("priceType") || "purchase");

  // Initialize cart for vendor and price type
  const [cart, setCart] = useState(() => {
    if (vendorId) {
      const storedCart = localStorage.getItem(`cart_${vendorId}_${priceType}`);
      return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
  });

  // Save cart when it changes
  useEffect(() => {
    if (vendorId) {
      localStorage.setItem(`cart_${vendorId}_${priceType}`, JSON.stringify(cart));
    }
  }, [cart, vendorId, priceType]);

  // Change vendor and reset cart
  const setVendor = (id) => {
    setVendorId(id);
    localStorage.setItem("vendorId", id);
    loadCart(id, priceType);
  };

  // Change price type and reset cart
  const changePriceType = (type) => {
    setPriceType(type);
    localStorage.setItem("priceType", type);
    if (vendorId) {
      loadCart(vendorId, type);
    }
  };

  // Load cart for vendor and price type
  const loadCart = (vendorId, type) => {
    const storedCart = localStorage.getItem(`cart_${vendorId}_${type}`);
    setCart(storedCart ? JSON.parse(storedCart) : []);
  };

  // Add to cart
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id);
      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity = item.quantity;
        updatedCart[existingItemIndex].totalPrice = item.totalPrice || item.price * item.quantity;
        return updatedCart;
      } else {
        return [...prevCart, item];
      }
    });
  };

  // Remove from cart
  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    if (vendorId) {
      localStorage.removeItem(`cart_${vendorId}_${priceType}`);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, setVendor, changePriceType, priceType }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
