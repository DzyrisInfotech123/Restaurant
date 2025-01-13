import React, { createContext, useState, useEffect } from "react";

// Create the CartContext
export const CartContext = createContext();

const CartProvider = ({ children }) => {
  // Initialize cart from localStorage or with an empty array
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id);

      if (existingItemIndex !== -1) {
        // If item exists, update quantity and total price
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity = item.quantity;
        updatedCart[existingItemIndex].totalPrice = item.totalPrice || item.price * item.quantity; // Update total price
        return updatedCart;
      } else {
        // If item is new, add it
        return [...prevCart, item];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.id !== itemId));
  };

  const clearCart = () => {
    setCart([]); // Clears the cart
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
