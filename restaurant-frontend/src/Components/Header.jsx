import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate to programmatically navigate
import { CartContext } from "./CartContext";
import CartModal from "./CartModal";
import logo from "../img/DFFOODS-removebg-preview.png";
import "./Header.css";


const Header = () => {
  const { cart } = useContext(CartContext);
  const [isCartModalOpen, setCartModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); // Initialize useNavigate hook

  const toggleCartModal = () => {
    setCartModalOpen(!isCartModalOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to handle "Your Orders" click
  const handleOrdersClick = () => {
    navigate("/order-confirmation"); // Navigate to OrderConfirmation page
    setIsDropdownOpen(false); // Close the dropdown menu after navigation
  };

  return (
    <header className="header flex justify-between items-center py-4">
      <div className="flex items-center space-x-4">
  <img src={logo} alt="Dzyris Frozen Foods" className="logo" />
</div>
      <div className="flex items-center space-x-4">
        {/* Profile Button with Dropdown */}
        <button className="btn login-btn" onClick={toggleDropdown}>
          <i className="fas fa-user"></i>
        </button>

        {/* Profile Dropdown Menu */}
        {isDropdownOpen && (
          <div ref={dropdownRef} className="dropdown-menu">
            <ul>
              <li>
                <i className="fas fa-user-circle"></i> Profile
              </li>
              <li onClick={handleOrdersClick}>
                <i className="fas fa-box"></i> Your Orders
              </li>
              <li>
                <i className="fas fa-sign-out-alt"></i> Logout
              </li>
            </ul>
          </div>
        )}

        {/* Cart Button */}
        <button className="btn" onClick={toggleCartModal}>
          <i className="fas fa-shopping-cart"></i> {cart?.length || 0}
        </button>
      </div>

      {/* Cart Modal */}
      {isCartModalOpen && <CartModal closeModal={toggleCartModal} />}
    </header>
  );
};

export default Header;
