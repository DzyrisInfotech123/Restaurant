import React, { useContext } from "react";
import { CartContext } from "./CartContext";
import "./CartModal.css";

const CartModal = ({ closeModal }) => {
  const { cart, addToCart, removeFromCart, clearCart } = useContext(CartContext);

  // Function to calculate the subtotal with add-ons and item quantity
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      // Make sure addOns exists and is an array
      const addOnTotal = Array.isArray(item.addOns)
        ? item.addOns.reduce((sum, addOn) => sum + parseFloat(addOn.price || 0), 0)
        : 0;

      const itemPrice = parseFloat(item.price || 0);
      const itemTotal = (itemPrice + addOnTotal) * (item.quantity || 1);

      return total + itemTotal;
    }, 0);
  };

  const deliveryCharge = 3.5; // Example delivery charge
  const subtotal = calculateSubtotal();
  const total = subtotal + deliveryCharge;

  const handleQuantityChange = (item, operation) => {
    const updatedItem = { ...item };

    // Increase or decrease the quantity
    if (operation === "increment") {
      updatedItem.quantity += 1;
    } else if (operation === "decrement" && updatedItem.quantity > 1) {
      updatedItem.quantity -= 1;
    }

    // Update the item in the cart
    addToCart(updatedItem);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  // Handle place order
  const handlePlaceOrder = () => {
    // Example: send cart data to the server
    // For now, we log it to the console
    console.log("Placing Order with the following cart data:", cart);

    // Clear the cart after placing the order
    clearCart();

    // Close the modal after placing the order
    closeModal();
    
    // Optionally, you can redirect to a confirmation page
    // For example: window.location.href = '/order-confirmation';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Your Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            {/* Cart Items Section */}
            <div className="cart-items">
              {cart.map((item, index) => (
                <div className="cart-item" key={index}>
                  <img
                    src={`http://localhost:4000${item.imgPath}`} // Use the correct path from backend
                    alt={item.name}
                    className="item-image"
                    onError={(e) => {
                      e.target.src = '/admin-backend/Routes/menuitems'; // Fallback image
                    }}
                  />
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p>₹{item.price}</p>
                    {Array.isArray(item.addOns) && item.addOns.length > 0 && (
                      <div className="add-ons-list">
                        <div className="add-ons-text">
                          <p>
                            Extras:{" "}
                            {item.addOns
                              .map((addOn, i) => `${addOn.name} (+₹${addOn.price})`)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="item-quantity">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item, "decrement")}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item, "increment")}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="remove-item-btn"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="Bill">
              <h3>Total Bill</h3>
            </div>
            <div className="cart-summary">
              <div className="item-breakdown">
                {cart.map((item, index) => {
                  const addOnTotal = Array.isArray(item.addOns)
                    ? item.addOns.reduce((sum, addOn) => sum + parseFloat(addOn.price || 0), 0)
                    : 0;

                  const itemPrice = parseFloat(item.price || 0);
                  const itemTotal = (itemPrice + addOnTotal) * (item.quantity || 1);

                  return (
                    <div className="breakdown-item" key={index}>
                      <p>
                        {item.name} {item.quantity} x ₹{itemPrice}{" "}
                        {Array.isArray(item.addOns) &&
                          item.addOns.length > 0 &&
                          `+ ${item.addOns
                            .map((addOn) => `${addOn.name} (₹${addOn.price})`)
                            .join(" + ")}`}{" "}
                        = ₹{itemTotal.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
              <p>Taxes: ₹{deliveryCharge.toFixed(2)}</p>
              <h3>Total: ₹{total.toFixed(2)}</h3>
            </div>

            {/* Place Order Button */}
            <div className="place-order-btn-container">
              <button className="place-order-btn" onClick={handlePlaceOrder}>
                Place Order
              </button>
            </div>
          </>
        )}
        <button className="close-btn" onClick={closeModal}>
          Close
        </button>
      </div>
    </div>
  );
};

export default CartModal;
