import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation hook
import ItemModal from "./ItemModal"; // Import the ItemModal
import "./Menu.css";

const Menu = ({ restaurant, addToCart }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatedMenuItems, setUpdatedMenuItems] = useState([]);
  const [priceType, setPriceType] = useState("sale"); // Added state for price type (purchase or sale)

  const location = useLocation(); // Get location
  const { priceType: queryPriceType } = location.state || {}; // Extract priceType from state

  // If the priceType is passed in state, update the priceType
  useEffect(() => {
    if (queryPriceType) {
      setPriceType(queryPriceType);
    }
  }, [queryPriceType]);

  const menuTypes = ["All", ...new Set(menuItems.map((item) => item.type))];

  const filteredItems = updatedMenuItems.filter((item) => {
    if (filter === "All") return true;
    return item.type === filter;
  });

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch("https://dev.digitalexamregistration.com/api/getVendor");
        if (!response.ok) throw new Error("Failed to fetch vendors");
        const data = await response.json();
        setVendors(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchVendors();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`https://dev.digitalexamregistration.com/api/getMenuItems?restaurantId=${restaurant._id}`);
      if (!response.ok) throw new Error("Failed to fetch menu items");
      const data = await response.json();
      setMenuItems(data);
      setUpdatedMenuItems(data);
      setError(null); // Clear any previous errors
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (restaurant) {
      fetchMenuItems();
    }
  }, [restaurant]);

  useEffect(() => {
    const fetchProductPricing = async () => {
      if (!selectedVendor) return;

      try {
        const response = await fetch(
          `https://dev.digitalexamregistration.com/api/getProductPricing?vendorId=${selectedVendor._id}&restaurantId=${restaurant._id}`
        );
        if (!response.ok) throw new Error("Failed to fetch product pricing");
        const data = await response.json();

        const updatedItems = menuItems.map((item) => {
          const pricingForItem = data.pricing.find(
            (pricing) => pricing.menuItemId._id.toString() === item._id.toString()
          );
          if (pricingForItem) {
            return { 
              ...item, 
              price: priceType === "sale" ? pricingForItem.salePrice : pricingForItem.purchasePrice 
            };
          }
          return item;
        });

        setUpdatedMenuItems(updatedItems);
        setError(null); // Clear any previous errors
      } catch (error) {
        // Instead of setting the error, just fetch the menu items again
        await fetchMenuItems(); // Wait for the menu items to be fetched
      }
    };

    fetchProductPricing();
  }, [selectedVendor, menuItems, restaurant._id, priceType]); // Add priceType to dependency array

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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
  }, [vendors]);

  const handleVendorChange = (e) => {
    const vendorId = e.target.value;
    const selectedVendor = vendors.find((vendor) => vendor._id === vendorId);
    setSelectedVendor(selectedVendor);
    localStorage.setItem("vendorId", vendorId);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <section className="menu my-8">
      <div className="menu-head">
        <h2 className="Restitle">{restaurant.name} - Menu</h2>
        <button className="back" onClick={() => window.location.href = '/home'}>
          Back to Restaurants
        </button>
      </div>

      {/* Price type dropdown is permanently hidden */}
      {/* <div className="price-type-select">
        <label htmlFor="price-type">Select Price Type: </label>
        <select id="price-type" value={priceType} onChange={(e) => setPriceType(e.target.value)}>
          <option value="sale">Sale Price</option>
          <option value="purchase">Purchase Price</option>
        </select>
      </div> */}

      {/* Filter options for menu items */}
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

      {filteredItems.length === 0 ? (
        <p>No menu items available for {filter}.</p>
      ) : (
        <div className="menu-grid">
          {filteredItems.map((item, index) => (
            <div
              key={index}
              className="menu-card"
              onClick={() => handleItemClick(item)}
            >
              <img
                src={`https://dev.digitalexamregistration.com/api/${item.imgPath}`}
                alt={item.name}
                className="menu-img"
              />
              <div className="menu-info">
                <h3 className="menu-name">{item.name}</h3>
                <p className="menu-desc">{item.description}</p>
                <span className="menu-price">₹ {item.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && selectedItem && (
        <ItemModal item={selectedItem} closeModal={handleCloseModal} addToCart={addToCart} />
      )}
    </section>
  );
};

export default Menu;