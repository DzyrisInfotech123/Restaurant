import React, { useState, useEffect } from "react";
import ItemModal from "./ItemModal"; // Import the ItemModal
import "./Menu.css";

const Menu = ({ restaurant, addToCart }) => {
  const [menuItems, setMenuItems] = useState([]); // State to store fetched menu items
  const [vendors, setVendors] = useState([]); // State to store vendors
  const [selectedVendor, setSelectedVendor] = useState(null); // Track the selected vendor
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [filter, setFilter] = useState("All"); // Menu filter state
  const [selectedItem, setSelectedItem] = useState(null); // Track the selected menu item
  const [isModalOpen, setIsModalOpen] = useState(false); // Track if the modal is open
  const [updatedMenuItems, setUpdatedMenuItems] = useState([]); // State to store updated menu items with vendor prices

  // Get unique types of menu items dynamically
  const menuTypes = ["All", ...new Set(menuItems.map((item) => item.type))];

  // Filter menu items based on the selected category
  const filteredItems = updatedMenuItems.filter((item) => {
    if (filter === "All") return true;
    return item.type === filter;
  });

  // Fetch vendors from the API
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/getVendor");
        if (!response.ok) {
          throw new Error("Failed to fetch vendors");
        }
        const data = await response.json();
        setVendors(data); // Save fetched vendors
      } catch (error) {
        setError(error.message);
      }
    };

    fetchVendors();
  }, []);

  // Fetch menu items based on the selected restaurant
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/getMenuItems?restaurantId=${restaurant._id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch menu items");
        }
        const data = await response.json();
        setMenuItems(data); // Save fetched menu items
        setUpdatedMenuItems(data); // Initialize updated menu items to the fetched data
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false); // Hide loading spinner
      }
    };

    if (restaurant) {
      fetchMenuItems();
    }
  }, [restaurant]);

  // Fetch product pricing for the selected vendor
  useEffect(() => {
    const fetchProductPricing = async () => {
      if (!selectedVendor) return; // Don't fetch if no vendor is selected

      try {
        // Fetch pricing using the vendor's _id
        const response = await fetch(
          `http://localhost:4000/api/getProductPricing?vendorId=${selectedVendor._id}&restaurantId=${restaurant._id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch product pricing");
        }
        const data = await response.json();

        // Update menu items with the fetched prices
        const updatedItems = menuItems.map((item) => {
          const pricingForItem = data.pricing.find(
            (pricing) => pricing.menuItemId._id.toString() === item._id.toString()
          );

          if (pricingForItem) {
            return {
              ...item,
              price: pricingForItem.price, // Update price from product pricing
            };
          }
          return item; // If no pricing exists, keep the original price
        });

        setUpdatedMenuItems(updatedItems); // Set the updated menu items with new prices
      } catch (error) {
        setError(error.message);
      }
    };

    fetchProductPricing();
  }, [selectedVendor, menuItems, restaurant._id]); // Trigger when vendor or menuItems change

  // Handle opening the modal when a menu item is clicked
  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Pre-select the vendor from localStorage
  useEffect(() => {
    if (vendors.length > 0) {
      const vendorId = localStorage.getItem("vendorId");
      if (vendorId) {
        const vendor = vendors.find((vendor) => vendor._id === vendorId);
        if (vendor) {
          setSelectedVendor(vendor);
        }
      }
    }
  }, [vendors]); // Trigger once vendors are fetched

  // Handle vendor change
  const handleVendorChange = (e) => {
    const vendorId = e.target.value;
    const selectedVendor = vendors.find((vendor) => vendor._id === vendorId);
    setSelectedVendor(selectedVendor); // Store the full vendor object
    localStorage.setItem("vendorId", vendorId); // Save the selected vendor ID in localStorage
  };

  // Render loading or error state
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Check if the user is logged in (by checking if vendorId is stored)
  const isLoggedIn = !!localStorage.getItem("vendorId");

  return (
    <section className="menu my-8">
      <div className="menu-head">
        <h2 className="Restitle">{restaurant.name} - Menu</h2>
        <button className="back" onClick={() => window.location.href = '/home'}>
  Back to Restaurants
</button>

      </div>

      {/* Vendor Selection Dropdown - Hide the dropdown */}
      {/* <div className="vendor-select">
        <h3>Select Vendor</h3>
        <select
          onChange={handleVendorChange}
          value={selectedVendor ? selectedVendor._id : ""}
        >
          <option value="">Select a vendor</option>
          {vendors.length === 0 ? (
            <option disabled>No vendors available</option>
          ) : (
            vendors.map((vendor) => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.vendorName}
              </option>
            ))
          )}
        </select>
      </div> */}

      {/* Filter Options */}
      <div className="filter-options">
        {menuTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`filter-btn ${filter === type ? "active" : ""}`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Display filtered menu items */}
      {filteredItems.length === 0 ? (
        <p>No menu items available for {filter}.</p>
      ) : (
        <div className="menu-grid">
          {filteredItems.map((item, index) => {
            return (
              <div
                key={index}
                className="menu-card"
                onClick={() => handleItemClick(item)}
              >
                <img
                  src={`http://localhost:4000${item.imgPath}`} // Use the correct path from backend
                  alt={item.name}
                  className="menu-img"
                  onError={(e) => {
                    e.target.src = '/admin-backend/Routes/menuitems'; // Fallback image
                  }}
                />
                <div className="menu-info">
                  <h3 className="menu-name">{item.name}</h3>
                  <p className="menu-desc">{item.description}</p>
                  <span className="menu-price">₹ {item.price}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Display Item Modal */}
      {isModalOpen && selectedItem && (
        <ItemModal
          item={selectedItem}
          closeModal={handleCloseModal}
          addToCart={addToCart}
        />
      )}
    </section>
  );
};

export default Menu;
