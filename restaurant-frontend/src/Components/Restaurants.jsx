import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Restaurants.css";
import Menu from "./Menu";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]); // State to hold restaurant data
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch restaurants from the API
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get("http://localhost:4001/api/getRestaurant"); // Update with your backend URL
        setRestaurants(response.data); // Store fetched data
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleRestaurantClick = (restaurant) => {
    if (restaurant.status === "Closed") {
      return; // Prevent interaction if restaurant is closed
    }
    console.log("Selected Restaurant:", restaurant); // Debugging line
    localStorage.setItem("restaurantId", restaurant._id); // Store the restaurant ID in localStorage
    setSelectedRestaurant(restaurant); // Set the selected restaurant
  };

  const handleTagClick = async (restaurant) => {
    // Prevent toggling when restaurant is selected
    if (restaurant.status === "Closed") {
      return;
    }

    // Toggle the status locally (doesn't persist to the backend yet)
    const updatedRestaurant = { ...restaurant, status: restaurant.status === "Open" ? "Closed" : "Open" };
    const updatedRestaurants = restaurants.map((r) =>
      r._id === updatedRestaurant._id ? updatedRestaurant : r
    );
    setRestaurants(updatedRestaurants); // Update state to re-render the restaurant list

    // Optionally, persist status change to backend
    try {
      await axios.put(`http://localhost:4001/api/updateRestaurant/${restaurant._id}`, {
        status: updatedRestaurant.status,
      });
    } catch (error) {
      console.error("Error updating restaurant status:", error);
      // Revert status on error
      setRestaurants(restaurants);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading message while fetching
  }

  // Render Menu if a restaurant is selected, otherwise display the restaurant list
  return selectedRestaurant ? (
    selectedRestaurant.status === "Closed" ? (
      <div className="closed-message">
        <h3>The restaurant is currently closed</h3>
      </div>
    ) : (
      <Menu
        restaurant={selectedRestaurant}
        menuItems={selectedRestaurant.menuItems || []} // Pass menu items dynamically if available
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
            {/* Update the image src to include the correct path */}
            <img
              src={`http://localhost:4001${restaurant.imgPath}`}
              alt={`${restaurant.name} logo`}
              className="restaurant-img"
              style={{ width: '100px', height: '100px', objectFit: 'cover' }} // Set size and object fit
            />
            <div className="restaurant-info">
              <h3 className="restaurant-name">{restaurant.name}</h3>
              <div className="details">
                <span>
                  <i className="fas fa-star"></i> 5 {/*{restaurant.rating}*/} (2345{/*{restaurant.reviews}*/})
                </span>
                <span>
                  <i className="fas fa-utensils"></i> {restaurant.type}
                </span>
                <span>₹ {restaurant.price}</span>
              </div>
              <div className="tags">
                <span
                  className={`status-tag ${restaurant.status === "Open" ? "open" : "closed"}`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering card click
                    handleTagClick(restaurant);
                  }}
                >
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
