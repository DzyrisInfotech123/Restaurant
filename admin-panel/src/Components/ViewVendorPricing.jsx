import React, { useState, useEffect } from "react";
import { Row, Col, List, message, Select, Typography, Spin } from "antd";
import axios from "axios";

const { Option } = Select;
const { Title } = Typography;

const ViewVendorPricing = () => {
  const [vendors, setVendors] = useState([]); // List of vendors
  const [restaurants, setRestaurants] = useState([]); // List of restaurants based on vendor selection
  const [selectedVendor, setSelectedVendor] = useState(null); // Selected vendor
  const [selectedRestaurant, setSelectedRestaurant] = useState(null); // Selected restaurant
  const [menuItems, setMenuItems] = useState([]); // List of menu items with pricing

  // Loading states
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [loadingMenuItems, setLoadingMenuItems] = useState(false);

  // Fetch vendors on initial load
  useEffect(() => {
    const fetchVendors = async () => {
      setLoadingVendors(true);
      try {
        const response = await axios.get("http://localhost:4001/api/getVendor");
        setVendors(response.data);
      } catch (error) {
        message.error("Error fetching vendors.");
        console.error("Error:", error);
      } finally {
        setLoadingVendors(false);
      }
    };
    fetchVendors();
  }, []);

  // Fetch restaurants when a vendor is selected
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!selectedVendor) return;

      setLoadingRestaurants(true);
      try {
        const response = await axios.get("http://localhost:4001/api/getRestaurant", {
          params: { vendorId: selectedVendor },
        });
        setRestaurants(response.data);
      } catch (error) {
        message.error("Error fetching restaurants.");
        console.error("Error:", error);
      } finally {
        setLoadingRestaurants(false);
      }
    };
    fetchRestaurants();
  }, [selectedVendor]);

  // Fetch menu items and pricing when a restaurant is selected
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!selectedRestaurant || !selectedVendor) return;

      setLoadingMenuItems(true);
      try {
        const response = await axios.get("http://localhost:4001/api/getProductPricing", {
          params: { restaurantId: selectedRestaurant, vendorId: selectedVendor },
        });

        if (response.data && response.data.pricing) {
          const menuData = response.data.pricing.map((item) => ({
            name: item.menuItemId.name,
            price: item.price,
            id: item.menuItemId._id,
          }));
          setMenuItems(menuData);
        } else {
          message.warning('No pricing data found.');
        }
      } catch (error) {
        message.error("Error fetching menu items.");
        console.error("Error:", error);
      } finally {
        setLoadingMenuItems(false);
      }
    };
    fetchMenuItems();
  }, [selectedRestaurant, selectedVendor]);

  const handleVendorChange = (value) => {
    setSelectedVendor(value);
    setSelectedRestaurant(null);
    setMenuItems([]); // Clear menu items when vendor changes
  };

  const handleRestaurantChange = (value) => {
    setSelectedRestaurant(value);
  };

  return (
    <div>
      <Title level={2}>View Vendor Menu</Title>

      {/* Vendor Selection */}
      <Row gutter={16}>
        <Col span={8}>
          <Select
            placeholder="Select Vendor"
            onChange={handleVendorChange}
            value={selectedVendor}
            style={{ width: "100%" }}
            loading={loadingVendors}
          >
            <Option value="">Select Vendor</Option>
            {vendors.map((vendor) => (
              <Option key={vendor._id} value={vendor._id}>
                {vendor.vendorName}
              </Option>
            ))}
          </Select>
        </Col>

        {/* Restaurant Selection */}
        {selectedVendor && (
          <Col span={8}>
            <Select
              placeholder="Select Restaurant"
              onChange={handleRestaurantChange}
              value={selectedRestaurant}
              style={{ width: "100%" }}
              loading={loadingRestaurants}
            >
              <Option value="">Select Restaurant</Option>
              {restaurants.map((restaurant) => (
                <Option key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </Option>
              ))}
            </Select>
          </Col>
        )}
      </Row>

      {/* Display Menu Items */}
      {menuItems.length > 0 && selectedRestaurant && (
        <div style={{ marginTop: "20px" }}>
          <Title level={3}>Menu Items</Title>
          <List
            itemLayout="horizontal"
            dataSource={menuItems}
            renderItem={(food) => (
              <List.Item key={food.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <List.Item.Meta
                  title={food.name}
                  description={`Price: ₹${food.price}`}
                />
              </List.Item>
            )}
          />
        </div>
      )}

      {/* Loading State */}
      {loadingMenuItems && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spin tip="Loading Menu Items..." />
        </div>
      )}
    </div>
  );
};

export default ViewVendorPricing;