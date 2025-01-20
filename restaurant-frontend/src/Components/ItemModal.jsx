import React, { useState, useContext } from "react";
import "./ItemModal.css";
import { CartContext } from "./CartContext"; // Import CartContext
import ConfirmationModal from "./ConfirmationModal"; // Import the ConfirmationModal

const ItemModal = ({ item, closeModal }) => {
  const { cart, addToCart } = useContext(CartContext); // Using CartContext
  const [quantity, setQuantity] = useState(1); // Quantity counter
  const [addOns, setAddOns] = useState([]); // Track selected add-ons
  const [showConfirmation, setShowConfirmation] = useState(false); // State to control confirmation modal
  const [existingItemIndex, setExistingItemIndex] = useState(null); // Track existing item index
  const [newQuantity, setNewQuantity] = useState(0); // Track the new quantity for confirmation

  // Handle quantity change
  const handleQuantityChange = (e) => {
    setQuantity(Number(e.target.value)); // Ensure value is a number
  };

  // Handle add-on selection
  const handleAddOnChange = (e, addOn) => {
    setAddOns((prevAddOns) =>
      prevAddOns.includes(addOn)
        ? prevAddOns.filter((existingAddOn) => existingAddOn !== addOn)
        : [...prevAddOns, addOn]
    );
  };

  // Generate unique ID for the item (including add-ons)
  const generateUniqueId = () => {
    const addOnString = addOns.map((addOn) => addOn.name).sort().join("-"); // Sort add-ons for consistent ID
    return `${item.name}-${addOnString}`;
  };

  const calculateTotalPrice = () => {
    const addOnTotal = addOns.reduce((total, addOn) => total + Number(addOn.price), 0);
    return item.price + addOnTotal;
  };

  // Handle add to cart
  const handleAddToCart = () => {
    const cartItem = {
      ...item,
      quantity,
      addOns,
      totalPrice: calculateTotalPrice() * quantity, // Calculate total price for the item
      id: generateUniqueId(), // Generate unique ID based on item and add-ons
    };

    // Check if the item with the same base name and add-ons is already in the cart
    const existingIndex = cart.findIndex(
      (cartItem) =>
        cartItem.name === item.name && // Compare base item name
        JSON.stringify(cartItem.addOns) === JSON.stringify(addOns) // Compare add-ons
    );

    if (existingIndex !== -1) {
      // Item with the same base name and add-ons is already in the cart
      const existingItem = cart[existingIndex];
      const updatedQuantity = existingItem.quantity + quantity; // Calculate the new quantity
      setNewQuantity(updatedQuantity); // Set the new quantity for confirmation
      setExistingItemIndex(existingIndex); // Store the index of the existing item
      setShowConfirmation(true); // Show confirmation modal
    } else {
      // Item is not in the cart, add it as a new item
      addToCart(cartItem);
      closeModal();
    }
  };

  // Handle confirmation
  const handleConfirm = () => {
    const existingItem = cart[existingItemIndex];
    const updatedQuantity = existingItem.quantity + quantity; // Update quantity
    const updatedTotalPrice = calculateTotalPrice() * updatedQuantity; // Update total price

    // Update the cart with the new quantity and total price
    addToCart({
      ...existingItem,
      quantity: updatedQuantity,
      totalPrice: updatedTotalPrice,
    });

    setShowConfirmation(false); // Close the confirmation modal
    closeModal(); // Close the item modal
  };

  const handleCancel = () => {
    setShowConfirmation(false); // Close the confirmation modal without making changes
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Item Image */}
        <div className="item-img-container">
        <img
                src={`https://dev.digitalexamregistration.com${item.imgPath}`} // Use the correct path from backend
                alt={item.name}
                className="menu-img"
                onError={(e) => {
                  e.target.src = '/admin-backend/Routes/menuitems'; // Fallback image
               }}
              />
        </div>

        <h2>{item.name}</h2>
        <p>{item.description}</p>
        <span>₹ {item.price}</span>

        {/* Add-ons Section */}
        <div className="extras">
          <h4>Add Ons</h4>
          <div className="add-ons-container">
            {item.addOns.map((addOn) => (
              <div key={addOn.name}>
                <input
                  type="checkbox"
                  value={addOn.name}
                  onChange={(e) => handleAddOnChange(e, addOn)}
                />
                {addOn.name} (+₹{addOn.price})
              </div>
            ))}
          </div>
        </div>

        {/* Quantity Section */}
        <div className="quantity">
          <h4>Quantity</h4>
          <input
            type="number"
            value={quantity}
            min="1"
            onChange={handleQuantityChange}
          />
        </div>

        {/* Action Buttons */}
        <div className="modal-buttons">
          <button onClick={handleAddToCart}>Add to Cart</button>
          <button onClick={closeModal}>Close</button>
        </div>
      </div>

      {showConfirmation && (
        <ConfirmationModal
          message={`Item already in cart. Update quantity to ${newQuantity}?`}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default ItemModal;
