import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import "./Menu.css";
import { CartContext } from "./CartContext";
import vegLogo from "../img/veg.png";
import nonVegLogo from "../img/nonveg.png";

const Menu = ({ restaurant }) => {
  const { cart, addToCart, removeFromCart } = useContext(CartContext);
  const [menuItems, setMenuItems] = useState([]);
  const [updatedMenuItems, setUpdatedMenuItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [priceType, setPriceType] = useState("purchase");
  const [filter, setFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { priceType: queryPriceType } = location.state || {};

  useEffect(() => {
    if (queryPriceType) {
      setPriceType(queryPriceType);
    }
  }, [queryPriceType]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(
          "https://dev.digitalexamregistration.com/api/getVendor"
        );
        if (!response.ok) throw new Error("Failed to fetch vendors");
        const data = await response.json();
        setVendors(data);

        const storedVendorId = localStorage.getItem("vendorId");
        const defaultVendor = data.find((v) => v._id === storedVendorId) || data[0];

        if (defaultVendor) {
          setSelectedVendor(defaultVendor);
          localStorage.setItem("vendorId", defaultVendor._id);
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchVendors();
  }, []);

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!restaurant) return;
      try {
        const response = await fetch(
          `https://dev.digitalexamregistration.com/api/getMenuItems?restaurantId=${restaurant._id}`
        );
        if (!response.ok) throw new Error("Failed to fetch menu items");
        const data = await response.json();
        setMenuItems(data);
        setUpdatedMenuItems(data);
        setError(null);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [restaurant]);

  useEffect(() => {
    const fetchProductPricing = async () => {
      if (!selectedVendor || menuItems.length === 0) return;

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

          return {
            ...item,
            price: pricingForItem
              ? priceType === "sale"
                ? pricingForItem.salePrice
                : pricingForItem.purchasePrice
              : item.price, // If no pricing data, fallback to menu item price
          };
        });

        setUpdatedMenuItems(updatedItems);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchProductPricing();
  }, [selectedVendor, menuItems, restaurant._id, priceType]);

  const menuTypes = ["All", ...new Set(menuItems.map((item) => item.type))];

  const filteredItems = updatedMenuItems.filter((item) => {
    return filter === "All" || item.type === filter;
  });

  const handleAddToCart = (item) => {
    addToCart({ ...item, quantity: 1, addOns: [] });
  };

  const handleQuantityChange = (item, operation) => {
    if (operation === "increment") {
      addToCart({ ...item, quantity: item.quantity + 1 });
    } else if (operation === "decrement") {
      if (item.quantity > 1) {
        addToCart({ ...item, quantity: item.quantity - 1 });
      } else {
        removeFromCart(item.id);
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <section className="menu my-8">
      <div className="menu-head">
        <h2 className="Restitle">{restaurant.name} - Menu</h2>
        <button className="back" onClick={() => (window.location.href = "/home")}>
          Back to Restaurants
        </button>
      </div>

      <div className="vendor-selection hidden">
        <label>Select Vendor: </label>
        <select
          value={selectedVendor?._id || ""}
          onChange={(e) => {
            const vendor = vendors.find((v) => v._id === e.target.value);
            setSelectedVendor(vendor);
          }}
        >
          {vendors.map((vendor) => (
            <option key={vendor._id} value={vendor._id}>
              {vendor.vendorName}
            </option>
          ))}
        </select>
      </div>

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
          {filteredItems.map((item, index) => {
            const cartItem = cart.find((cartItem) => cartItem.id === item.id);
            return (
              <div key={index} className="menu-card">
                <img src={item.type === "Veg" ? vegLogo : nonVegLogo} alt={item.type} className="food-logo" />
                <img
                  src={`https://dev.digitalexamregistration.com/api/${item.imgPath}`}
                  alt={item.name}
                  className="menu-img"
                />
                <div className="menu-info">
                  <h3 className="menu-name">{item.name}</h3>
                  <p className="menu-desc">{item.description}</p>
                  <span className="menu-price">₹ {item.price}</span>
                  {cartItem ? (
                    <div className="item-quantity">
                      <button className="filter-btn" onClick={() => handleQuantityChange(cartItem, "decrement")}>−</button>
                      <span>{cartItem.quantity}</span>
                      <button className="filter-btn" onClick={() => handleQuantityChange(cartItem, "increment")}>+</button>
                    </div>
                  ) : (
                    <button className="add-to-cart-btn" onClick={() => handleAddToCart(item)}>Add to Cart</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Menu;
