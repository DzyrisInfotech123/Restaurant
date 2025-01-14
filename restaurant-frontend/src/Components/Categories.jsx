import React from "react";
import "./Categories.css";

const Categories = () => {
  const categories = [
    { icon: "fas fa-fire", label: "Popular", options: "286+ options" },
    { icon: "fas fa-bicycle", label: "Fast Delivery", options: "1,843+ options" },
    { icon: "fas fa-star", label: "High class", options: "25+ options" },
    { icon: "fas fa-utensils", label: "Dine in", options: "182+ options" },
    { icon: "fas fa-home", label: "Pick up", options: "3,548+ options" },
    { icon: "fas fa-map-marker-alt", label: "Nearest", options: "44+ options" },
  ];

  return (
    <section className="categories">
      <h2 className="title">Explore Categories</h2>
      <div className="categories-grid">
        {categories.map((category, index) => (
          <div key={index} className="category-card">
            <i className={`${category.icon} icon`}></i>
            <h3 className="category-label">{category.label}</h3>
            <p className="category-options">{category.options}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;
