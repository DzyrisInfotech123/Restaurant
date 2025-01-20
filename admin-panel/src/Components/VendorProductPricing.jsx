import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, message, Row, Col } from "antd";
import axios from "axios";

const { Option } = Select;

const VendorProductPricing = () => {
  const [vendors, setVendors] = useState([]); // State to store vendor list
  const [restaurants, setRestaurants] = useState([]); // State to store restaurant list based on selected vendor
  const [menuItems, setMenuItems] = useState([]); // State to store menu items based on selected restaurant and vendor
  const [selectedVendor, setSelectedVendor] = useState(null); // State to store selected vendor
  const [selectedRestaurant, setSelectedRestaurant] = useState(null); // State to store selected restaurant
  const [productPricing, setProductPricing] = useState({}); // State to store product pricing for each product

  // Fetch vendors on initial load
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get("http://localhost:4001/api/getVendor");
        setVendors(response.data);
      } catch (error) {
        message.error("Error fetching vendors.");
        console.error("Error:", error);
      }
    };

    fetchVendors();
  }, []);

  // Fetch restaurants when a vendor is selected
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!selectedVendor) return;

      try {
        const response = await axios.get("http://localhost:4001/api/getRestaurant", {
          params: { vendorId: selectedVendor },
        });
        setRestaurants(response.data);
      } catch (error) {
        message.error("Error fetching restaurants.");
        console.error("Error:", error);
      }
    };

    fetchRestaurants();
  }, [selectedVendor]);

  // Fetch menu items and pricing when a restaurant and vendor are selected
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!selectedRestaurant || !selectedVendor) return;
  
      try {
        const response = await axios.get("http://localhost:4001/api/getMenuItems", {
          params: { restaurantId: selectedRestaurant, vendorId: selectedVendor },
        });
        setMenuItems(response.data);
  
        // Fetch the existing pricing for the selected vendor and restaurant
        const pricingResponse = await axios.get("http://localhost:4001/api/getProductPricing", {
          params: { vendorId: selectedVendor, restaurantId: selectedRestaurant },
        });
  
        // Ensure pricingResponse.data.pricing is an array before using reduce
        if (Array.isArray(pricingResponse.data.pricing)) {
          const pricingData = pricingResponse.data.pricing.reduce((acc, pricing) => {
            acc[pricing.menuItemId._id] = pricing.price;
            return acc;
          }, {});
  
          setProductPricing(pricingData); // Set the pricing in state
        } else {
          console.error("Invalid data structure received from the pricing API:", pricingResponse.data);
        }
      } catch (error) {
        message.error("Error fetching menu items or pricing.");
        console.error("Error:", error);
      }
    };
  
    fetchMenuItems();
  }, [selectedRestaurant, selectedVendor]);
  
  // Handle vendor change
  const handleVendorChange = (value) => {
    setSelectedVendor(value);
    setSelectedRestaurant(null);
    setMenuItems([]);
    setProductPricing({}); // Clear product pricing on vendor change
  };

  // Handle restaurant change
  const handleRestaurantChange = (value) => {
    setSelectedRestaurant(value);
    setProductPricing({}); // Clear previous pricing when restaurant changes
  };

  // Handle rate change for a specific product
  const handleRateChange = (menuItemId, value) => {
    setProductPricing((prev) => ({
      ...prev,
      [menuItemId]: value,
    }));
  };

  // Handle form submission
  const onFinish = async () => {
    if (Object.keys(productPricing).length === 0) {
      message.error("Please enter pricing for the products.");
      return;
    }

    // Prepare the pricing data for each menu item
    const pricingData = Object.keys(productPricing).map((menuItemId) => ({
      menuItemId, // Ensure this is the correct reference for MenuItem
      vendorId: selectedVendor,
      restaurantId: selectedRestaurant,
      price: productPricing[menuItemId],
    }));

    try {
      // Send the pricing data to the backend
      const response = await axios.post(
        "http://localhost:4001/api/addProductPricing",
        {
          vendorId: selectedVendor,
          restaurantId: selectedRestaurant,
          pricingData: pricingData,
        }
      );
      if (response.status === 200 || response.status === 201) {
        message.success("Product pricing updated successfully!");
      }
    } catch (error) {
      message.error("Error saving product pricing.");
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h2>Vendor Product Pricing</h2>
      <Form onFinish={onFinish} layout="vertical">
        {/* Vendor Selection */}
        <Form.Item label="Select Vendor" required>
          <Select
            placeholder="Select Vendor"
            onChange={handleVendorChange}
            value={selectedVendor}
          >
            {vendors.map((vendor) => (
              <Option key={vendor._id} value={vendor._id}>
                {vendor.vendorName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Restaurant Selection */}
        {selectedVendor && (
          <Form.Item label="Select Restaurant" required>
            <Select
              placeholder="Select Restaurant"
              onChange={handleRestaurantChange}
              value={selectedRestaurant}
            >
              {restaurants.map((restaurant) => (
                <Option key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* Display Menu Items and Pricing Inputs */}
        {menuItems.length > 0 ? (
          <div>
            <h3>Menu Items</h3>
            {menuItems.map((food) => (
              <Row key={food._id} gutter={16} style={{ marginBottom: 8 }}>
                <Col span={8}>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Input
                      disabled
                      value={food.name}
                      style={{ width: "80%", color: "black" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Input
                      placeholder="Enter price"
                      value={productPricing[food._id] || ""}
                      onChange={(e) => handleRateChange(food._id, e.target.value)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            ))}
          </div>
        ) : (
          <p>No products available.</p>
        )}

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Pricing
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default VendorProductPricing;
