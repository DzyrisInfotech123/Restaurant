import React, { useContext, useState } from "react";
import { CartContext } from "./CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./CartModal.css";

const CartModal = ({ closeModal }) => {
  const { cart, addToCart, removeFromCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const priceType = location.state?.priceType || localStorage.getItem("priceType") || "purchase";

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const addOnTotal = Array.isArray(item.addOns)
        ? item.addOns.reduce((sum, addOn) => sum + parseFloat(addOn.price || 0), 0)
        : 0;
      const itemPrice = parseFloat(item.price || 0);
      const itemTotal = (itemPrice + addOnTotal) * (item.quantity || 1);
      return total + itemTotal;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const taxPercentage = 0.12;
  const taxes = subtotal * taxPercentage;
  const total = subtotal + taxes;

  const handleQuantityChange = (item, operation) => {
    const updatedItem = { ...item };
    if (operation === "increment") {
      updatedItem.quantity += 1;
    } else if (operation === "decrement" && updatedItem.quantity > 1) {
      updatedItem.quantity -= 1;
    }
    addToCart(updatedItem);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handlePlaceOrder = () => {
    setShowConfirmModal(true);
  };

  const generateOrderNumber = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };

  const handleConfirmOrder = async () => {
    const vendorId = localStorage.getItem("vendorId");
    if (!vendorId) {
      console.error("Vendor ID is missing.");
      return;
    }

    const updatedCart = cart.map((item) => {
      const itemPrice = parseFloat(item.price || 0);
      const addOnTotal = Array.isArray(item.addOns)
        ? item.addOns.reduce((sum, addOn) => sum + parseFloat(addOn.price || 0), 0)
        : 0;
      const totalPrice = (itemPrice + addOnTotal) * (item.quantity || 1);

      return {
        ...item,
        vendorId: item.vendorId || vendorId,
        imgPath: item.imgPath || "",
        totalPrice,
      };
    });
    localStorage.setItem("priceType", "purchase");
    const orderNumber = generateOrderNumber();
    const orderDetails = {
      orderNumber,
      cart: updatedCart,
      vendorId,
      subtotal,
      taxes,
      total,
      priceType,
      date: new Date().toISOString(),
    };

    console.log("Order Details:", orderDetails);

    try {
      const response = await fetch("https://dev.digitalexamregistration.com/api/placeOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderDetails),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log("Order placed successfully!", responseData);
      } else {
        console.error("Failed to place order:", responseData.error || responseData);
      }

      clearCart();
      navigate("/SaleOrder", {
        state: { orderNumber, cart, total, taxes, subtotal },
      });

      closeModal();
      setShowConfirmModal(false);
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  const handleCancelOrder = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={closeModal}>
          &#x2715;
        </button>

        <h2>Your Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item, index) => (
                <div className="cart-item" key={index}>
                  <img
                    src={`https://dev.digitalexamregistration.com/api/${item.imgPath}`}
                    alt={item.name}
                    className="item-image"
                    onError={(e) => {
                      e.target.src = "/path/to/default-image.jpg";
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
                              .map((addOn) => `${addOn.name} (+₹${addOn.price})`)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="item-quantity">
                    <button className="quantity-btn" onClick={() => handleQuantityChange(item, "decrement")}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button className="quantity-btn" onClick={() => handleQuantityChange(item, "increment")}>
                      +
                    </button>
                  </div>
                  <button className="remove-item-btn" onClick={() => handleRemoveItem(item.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="Bill">
              <h3>Total Bill</h3>
            </div>
            <div className="cart-summary">
              <p>Subtotal : ₹{subtotal.toFixed(2)}</p>
              <p>GST : ₹{taxes.toFixed(2)}</p>
              <h3>Total: ₹{total.toFixed(2)}</h3>
            </div>

            <div className="place-order-btn-container">
              <button className="place-order-btn" onClick={handlePlaceOrder}>
                Place Order
              </button>
            </div>
          </>
        )}
      </div>

      {showConfirmModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <h3>Confirm Order</h3>
            <p>Are you sure you want to place this order?</p>
            <div className="confirm-buttons">
              <button className="confirm-btn" onClick={handleConfirmOrder}>
                Yes, Place Order
              </button>
              <button className="cancel-btn" onClick={handleCancelOrder}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartModal;
