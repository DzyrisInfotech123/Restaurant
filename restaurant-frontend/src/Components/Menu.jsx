import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import "./Menu.css";
import { CartContext } from "./CartContext";
import vegLogo from "../img/veg.png"; // Import Veg Logo
import nonVegLogo from "../img/nonveg.png"; // Import Non-Veg Logo

const Menu = ({ restaurant }) => {
  const { cart, addToCart, removeFromCart } = useContext(CartContext);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedMenuItems, setUpdatedMenuItems] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchMenuItems = async () => {
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

    if (restaurant) {
      fetchMenuItems();
    }
  }, [restaurant]);

  const menuTypes = ["All", ...new Set(menuItems.map((item) => item.type))];

  const filteredItems = updatedMenuItems.filter((item) => {
    if (filter === "All") return true;
    return item.type === filter;
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
                {/* Show Veg or Non-Veg Logo */}
                <img
  src={item.type === "Veg" ? vegLogo : nonVegLogo}
  alt={item.type === "Veg" ? "Veg" : "Non-Veg"}
  className="food-logo"
/>


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
                      <button className="quantity-btn" onClick={() => handleQuantityChange(cartItem, "decrement")}>
                        −
                      </button>
                      <span className="quantity-value">{cartItem.quantity}</span>
                      <button className="quantity-btn" onClick={() => handleQuantityChange(cartItem, "increment")}>
                        +
                      </button>
                    </div>
                  ) : (
                    <button className="add-to-cart-btn" onClick={() => handleAddToCart(item)}>
                      Add to Cart
                    </button>
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
