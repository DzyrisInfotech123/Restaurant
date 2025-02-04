import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, message, Row, Col } from "antd";
import axios from "axios";

const { Option } = Select;

const VendorProductPricing = () => {
  const [vendors, setVendors] = useState([]); // List of vendors
  const [restaurants, setRestaurants] = useState([]); // List of restaurants
  const [menuItems, setMenuItems] = useState([]); // List of menu items
  const [selectedVendor, setSelectedVendor] = useState(null); // Selected vendor
  const [selectedRestaurant, setSelectedRestaurant] = useState(null); // Selected restaurant
  const [productPricing, setProductPricing] = useState({}); // Pricing state

  // Fetch vendors on load
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(
          "https://dev.digitalexamregistration.com/api/getVendor"
        );
        setVendors(response.data);
      } catch (error) {
        message.error("Error fetching vendors.");
        console.error(error);
      }
    };
    fetchVendors();
  }, []);

  // Fetch restaurants when vendor is selected
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!selectedVendor) return;

      try {
        const response = await axios.get(
          "https://dev.digitalexamregistration.com/api/getRestaurant",
          { params: { vendorId: selectedVendor } }
        );
        setRestaurants(response.data);
      } catch (error) {
        message.error("Error fetching restaurants.");
        console.error(error);
      }
    };
    fetchRestaurants();
  }, [selectedVendor]);

  // Fetch menu items and pricing when restaurant and vendor are selected
  useEffect(() => {
    const fetchMenuItemsAndPricing = async () => {
      if (!selectedVendor || !selectedRestaurant) return;

      try {
        // Fetch menu items
        const menuResponse = await axios.get(
          "https://dev.digitalexamregistration.com/api/getMenuItems",
          { params: { vendorId: selectedVendor, restaurantId: selectedRestaurant } }
        );
        setMenuItems(menuResponse.data);

        // Fetch pricing data
        const pricingResponse = await axios.get(
          "https://dev.digitalexamregistration.com/api/getProductPricing",
          { params: { vendorId: selectedVendor, restaurantId: selectedRestaurant } }
        );

        if (Array.isArray(pricingResponse.data.pricing)) {
          // Map prices to product IDs
          const pricingMap = pricingResponse.data.pricing.reduce((acc, item) => {
            acc[item.menuItemId._id] = {
              purchasePrice: item.purchasePrice,
              salePrice: item.salePrice,
            };
            return acc;
          }, {});
          setProductPricing(pricingMap);
        } else {
          message.warning("No pricing data found.");
        }
      } catch (error) {
        message.error("Error fetching menu items or pricing.");
        console.error(error);
      }
    };
    fetchMenuItemsAndPricing();
  }, [selectedVendor, selectedRestaurant]);

  // Handle vendor change
  const handleVendorChange = (value) => {
    setSelectedVendor(value);
    setSelectedRestaurant(null);
    setMenuItems([]);
    setProductPricing({});
  };

  // Handle restaurant change
  const handleRestaurantChange = (value) => {
    setSelectedRestaurant(value);
    setProductPricing({});
  };

  // Handle purchase and sale price changes
  const handlePriceChange = (menuItemId, type, value) => {
    setProductPricing((prev) => ({
      ...prev,
      [menuItemId]: {
        ...prev[menuItemId],
        [type]: value,
      },
    }));
  };

  // Handle form submission
  const onFinish = async () => {
    if (Object.keys(productPricing).length === 0) {
      message.error("Please enter pricing for the products.");
      return;
    }

    const pricingData = Object.keys(productPricing).map((menuItemId) => ({
      menuItemId,
      vendorId: selectedVendor,
      restaurantId: selectedRestaurant,
      purchasePrice: productPricing[menuItemId].purchasePrice,
      salePrice: productPricing[menuItemId].salePrice,
    }));

    try {
      const response = await axios.post(
        "https://dev.digitalexamregistration.com/api/addProductPricing",
        { vendorId: selectedVendor, restaurantId: selectedRestaurant, pricingData }
      );
      if (response.status === 200 || response.status === 201) {
        message.success("Product pricing updated successfully!");
      }
    } catch (error) {
      message.error("Error saving product pricing.");
      console.error(error);
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
                <Col span={8}>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Input
                      placeholder="Enter Purchase Price"
                      value={productPricing[food._id]?.purchasePrice || ""}
                      onChange={(e) =>
                        handlePriceChange(food._id, "purchasePrice", e.target.value)
                      }
                      onKeyPress={(e) => {
                        // Allow only numbers and decimal point
                        if (!/[0-9.]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Input
                      placeholder="Enter Sale Price"
                      value={productPricing[food._id]?.salePrice || ""}
                      onChange={(e) =>
                        handlePriceChange(food._id, "salePrice", e.target.value)
                      }
                      onKeyPress={(e) => {
                        // Allow only numbers and decimal point
                        if (!/[0-9.]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
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