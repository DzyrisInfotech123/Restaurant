import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Restaurants.css";
import Menu from "./Menu";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]); // State to hold restaurant data
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [priceType, setPriceType] = useState(localStorage.getItem("priceType") || "purchase"); // Retrieve priceType from localStorage

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const vendorId = localStorage.getItem("vendorId"); // Get vendorId from local storage
        const response = await axios.get(`https://dev.digitalexamregistration.com/api/getRestaurant`);
        let allRestaurants = response.data;

        // Filter restaurants:
        // - Show restaurants where vendorId matches OR default is "True"
        let filteredRestaurants = allRestaurants.filter(
          (restaurant) => restaurant.vendorId === vendorId || restaurant.default === "true"
        );

        // Fetch menu prices if restaurant price is not available
        const updatedRestaurants = await Promise.all(
          filteredRestaurants.map(async (restaurant) => {
            let updatedRestaurant = { ...restaurant };

            // If the restaurant price is missing, fetch menu items
            if (!restaurant.price) {
              try {
                const menuResponse = await axios.get(
                  `https://dev.digitalexamregistration.com/api/getMenuItems?restaurantId=${restaurant._id}`
                );
                const menuItems = menuResponse.data;
                
                if (menuItems.length > 0) {
                  // Find the lowest price from the menu items
                  const minPrice = Math.min(...menuItems.map((item) => item.price || Infinity));
                  
                  if (minPrice !== Infinity) {
                    updatedRestaurant.price = minPrice; // Set restaurant price to the minimum menu price
                  }
                }
              } catch (menuError) {
                console.error(`Error fetching menu for ${restaurant.name}:`, menuError);
              }
            }

            return updatedRestaurant;
          })
        );

        setRestaurants(updatedRestaurants);
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleRestaurantClick = (restaurant) => {
    if (restaurant.status === "Closed") return; // Prevent interaction if restaurant is closed

    console.log("Selected Restaurant:", restaurant);
    localStorage.setItem("restaurantId", restaurant._id);
    setSelectedRestaurant(restaurant);
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading message while fetching
  }

  return selectedRestaurant ? (
    selectedRestaurant.status === "Closed" ? (
      <div className="closed-message">
        <h3>The restaurant is currently closed</h3>
      </div>
    ) : (
      <Menu
        restaurant={selectedRestaurant}
        menuItems={selectedRestaurant.menuItems || []}
        priceType={priceType}
      />
    )
  ) : (
    <section className="restaurants my-8">
      <div className="Reshead">
        <h2 className="title">Restaurants</h2>
        <a href="#" className="see-all">
          See all
        </a>
      </div>
      <div className="restaurants-grid">
        {restaurants.map((restaurant, index) => (
          <div
            key={index}
            className={`restaurant-card ${restaurant.status === "Closed" ? "closed" : ""}`}
            onClick={() => handleRestaurantClick(restaurant)}
          >
            <img
              src={`https://dev.digitalexamregistration.com/api/${restaurant.imgPath}`}
              alt={`${restaurant.name} logo`}
              className="restaurant-img"
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
            <div className="restaurant-info">
              <h3 className="restaurant-name">{restaurant.name}</h3>
              <div className="details">
                <span>
                  <i className="fas fa-star"></i> 5 (2345)
                </span>
                <span>
                  <i className="fas fa-utensils"></i> {restaurant.type}
                </span>
                <span>₹ {restaurant.price || "N/A"}</span>
              </div>
              <div className="tags">
                <span className={`status-tag ${restaurant.status === "Open" ? "open" : "closed"}`}>
                  {restaurant.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Restaurants;
