import React, { createContext, useState, useEffect } from "react";

// Create the CartContext
export const CartContext = createContext();

const CartProvider = ({ children }) => {
  // Track the current vendor ID (e.g., from the logged-in user or session)
  const [vendorId, setVendorId] = useState(localStorage.getItem("vendorId") || null);

  // Initialize cart for a specific vendor from localStorage
  const [cart, setCart] = useState(() => {
    if (vendorId) {
      const storedCart = localStorage.getItem(`cart_${vendorId}`);
      console.log(`Loading cart for vendor ${vendorId}:`, storedCart); // Debugging log
      return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
  });

  // Save cart to localStorage for the specific vendor whenever it changes
  useEffect(() => {
    if (vendorId) {
      console.log("Saving cart for vendor:", vendorId, cart); // Debugging log
      localStorage.setItem(`cart_${vendorId}`, JSON.stringify(cart));
    }
  }, [cart, vendorId]);

  // Set the vendor ID (this could be done after login or when selecting a vendor)
  const setVendor = (id) => {
    console.log("Setting vendor ID:", id); // Debugging log
    setVendorId(id);
    localStorage.setItem("vendorId", id); // Save vendorId in localStorage

    // When the vendor changes, load their cart
    const storedCart = localStorage.getItem(`cart_${id}`);
    console.log(`Cart for vendor ${id}:`, storedCart); // Debugging log
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    } else {
      setCart([]); // Default to an empty cart if no cart exists for this vendor
    }
  };

  // Add to cart function
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id);

      if (existingItemIndex !== -1) {
        // If item exists, update quantity and total price
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity = item.quantity;
        updatedCart[existingItemIndex].totalPrice = item.totalPrice || item.price * item.quantity; // Update total price
        localStorage.setItem(`cart_${vendorId}`, JSON.stringify(updatedCart)); // Save updated cart for vendor
        return updatedCart;
      } else {
        // If item is new, add it
        const updatedCart = [...prevCart, item];
        localStorage.setItem(`cart_${vendorId}`, JSON.stringify(updatedCart)); // Save updated cart for vendor
        return updatedCart;
      }
    });
  };

  // Remove from cart function
  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== itemId);
      localStorage.setItem(`cart_${vendorId}`, JSON.stringify(updatedCart)); // Save updated cart for vendor
      return updatedCart;
    });
  };

  // Clear cart function
  const clearCart = () => {
    setCart([]); // Clears the cart for the current vendor
    if (vendorId) {
      console.log("Clearing cart for vendor:", vendorId); // Debugging log
      localStorage.removeItem(`cart_${vendorId}`); // Remove cart from localStorage
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, setVendor }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
