import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { CartContext } from "./CartContext";
import CartModal from "./CartModal";
import logo from "../img/DFFOODS-removebg-preview.png"; // Original logo
import "./Header.css";

const Header = ({ priceType }) => { // Accept priceType as a prop
  const { cart } = useContext(CartContext);
  const [isCartModalOpen, setCartModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [vendorName, setVendorName] = useState(""); // State for vendor name
  const [userRole, setUserRole] = useState(""); // State for user role
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchVendorDetails = async () => {
      const vendorId = localStorage.getItem("vendorId"); // Retrieve vendorId from localStorage

      if (vendorId) {
        try {
          const response = await fetch(`https://your-backend-api.com/vendors/${vendorId}`); // Replace with your actual API URL
          if (response.ok) {
            const data = await response.json();
            setVendorName(data.vendorName); // Assuming API response contains { vendorName: "Ses Trading" }
          } else {
            console.error("Failed to fetch vendor details");
          }
        } catch (error) {
          console.error("Error fetching vendor details:", error);
        }
      }
    };

    fetchVendorDetails();
  }, []);

  useEffect(() => {
    // Retrieve user role from localStorage
    const role = localStorage.getItem("role");
    setUserRole(role); // Set the user role state
  }, []);

  const toggleCartModal = () => {
    setCartModalOpen(!isCartModalOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

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

  const handleOrdersClick = () => {
    navigate("/order-confirmation");
    setIsDropdownOpen(false);
  };

  const handleSaleOrdersClick = () => {
    navigate("/SaleOrder"); // Navigate to Sale Orders page
    setIsDropdownOpen(false);
  };

  const handleLogin = () => {
    navigate("/");
    setIsDropdownOpen(false);
  };

  const handleHome = () => {
    navigate("/home");
  };

  return (
    <header className="header flex justify-between items-center py-4">
      <div className="flex items-center space-x-4">
        <img src={logo} alt="Dzyris Frozen Foods" className="logo" onClick={handleHome}/>
        {/* Display "Hello, Vendor Name" if vendorName is available */}
        {vendorName && <span className="vendor-greeting">Hello, {vendorName}!</span>}
      </div>
      <div className="flex items-center space-x-4">
        <button className="btn login-btn" onClick={toggleDropdown}>
          <i className="fas fa-user"></i>
        </button>

        {isDropdownOpen && (
          <div ref={dropdownRef} className="dropdown-menu">
            <ul>
              <li>
                <i className="fas fa-user-circle"></i> Profile
              </li>
              <li onClick={handleSaleOrdersClick}>
                <i className="fas fa-tags"></i> Sale Orders
              </li>
              <li onClick={handleLogin}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </li>
            </ul>
          </div>
        )}

        <button className="btn" onClick={toggleCartModal}>
          <i className="fas fa-shopping-cart"></i> {cart?.length || 0}
        </button>
      </div>

      {isCartModalOpen && <CartModal closeModal={toggleCartModal} />}
    </header>
  );
};

export default Header;