import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import Header from "./Header";
import Categories from "./Categories";
import Restaurants from "./Restaurants";

const Home = () => {
  const location = useLocation(); // Get the current location
  const [priceType, setPriceType] = useState(localStorage.getItem("priceType") || "sale"); // Retrieve priceType from localStorage

  useEffect(() => {
    // Retrieve priceType from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const urlPriceType = queryParams.get("priceType");

    if (urlPriceType) {
      setPriceType(urlPriceType);
      localStorage.setItem("priceType", urlPriceType); // Store it in localStorage
    }

    // Log the priceType to the console
    console.log("Current priceType:", priceType);
  }, [location.search]); // Run effect when location.search changes

  return (
    <div className="app">
      <Header />
      <main className="container mx-auto p-4">
        <Restaurants priceType={priceType} /> {/* Pass priceType to Restaurants */}
        <Categories />
      </main>
    </div>
  );
}

export default Home;