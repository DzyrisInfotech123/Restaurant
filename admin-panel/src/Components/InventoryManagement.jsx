import React, { useState, useEffect } from "react";
import { Select, Table, Input, Button, message, Modal, Form, InputNumber, Upload, Space } from "antd";
import { UploadOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "./Services/Api";

const { Option } = Select;

const InventoryManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [stockData, setStockData] = useState({});
  const [updatedStock, setUpdatedStock] = useState({});
  const [editableRows, setEditableRows] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRestaurants();

    if (location.pathname === "/addmenu") {
      setIsModalVisible(true);
    }
  }, [location.pathname]);

  const fetchRestaurants = async () => {
    try {
      const { data } = await axios.get(`/getRestaurant`);
      setRestaurants(data);

      if (data.length > 0) {
        setSelectedRestaurant(data[0]._id);
        fetchMenuItems(data[0]._id);
      }
    } catch (error) {
      message.error("Failed to fetch restaurants.");
    }
  };

  const fetchMenuItems = async (restaurantId) => {
    try {
      const { data: menuItemsData } = await axios.get(`/getMenuItems?restaurantId=${restaurantId}`);
      setMenuItems(menuItemsData);

      // Fetch stock only based on restaurant (no vendor ID)
      const { data: stockResponse } = await axios.get(`/getStock?restaurantId=${restaurantId}`);
      const stockMap = {};
      stockResponse.stock.forEach((stockItem) => {
        stockMap[stockItem.menuItemId._id] = stockItem.inStock;
      });

      setStockData(stockMap);
      setUpdatedStock({});
      setEditableRows({});
    } catch (error) {
      message.error("Failed to fetch menu items or stock data.");
    }
  };

  const handleRestaurantChange = (value) => {
    setSelectedRestaurant(value);
    if (value) {
      fetchMenuItems(value);
    } else {
      setMenuItems([]);
      setStockData({});
    }
  };

  const handleStockChange = (value, itemId) => {
    setUpdatedStock((prev) => ({
      ...prev,
      [itemId]: parseInt(value) || 0,
    }));
  };

  const handleUpdateClick = (itemId) => {
    setEditableRows((prev) => ({
      ...prev,
      [itemId]: true,
    }));
  };

  const handleSaveStock = async () => {
    try {
      if (!selectedRestaurant) {
        message.error("Restaurant selection is missing.");
        return;
      }

      const stockUpdates = Object.keys(updatedStock).map((itemId) => ({
        itemId,
        inStock: updatedStock[itemId],
      }));

      if (stockUpdates.length === 0) {
        message.warning("No changes to save.");
        return;
      }

      await axios.post(`/updateStock`, {
        restaurantId: selectedRestaurant,
        stockUpdates,
      });

      message.success("Stock updated successfully!");
      fetchMenuItems(selectedRestaurant);
    } catch (error) {
      message.error("Failed to update stock.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Select
        placeholder="Select a restaurant"
        style={{ width: 300, marginBottom: "20px" }}
        value={selectedRestaurant || (restaurants.length > 0 ? restaurants[0]._id : undefined)}
        onChange={handleRestaurantChange}
      >
        {restaurants.map((restaurant) => (
          <Option key={restaurant._id} value={restaurant._id}>
            {restaurant.name}
          </Option>
        ))}
      </Select>

      {menuItems.length > 0 ? (
        <>
          <Table
            dataSource={menuItems.map((item, index) => ({
              ...item,
              key: index,
            }))}
            columns={[
              {
                title: "Image",
                dataIndex: "imgPath",
                key: "imgPath",
                render: (imgPath) => (
                  <img
                    src={`https://dev.digitalexamregistration.com/api/${imgPath}`}
                    alt="Menu Item"
                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                  />
                ),
              },
              { title: "Item", dataIndex: "name", key: "name" },
              { title: "Price", dataIndex: "price", key: "price" },
              {
                title: "Current Stock",
                dataIndex: "Current Stock",
                key: "Current Stock",
                render: (text, record) => (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Input
                      type="number"
                      min="0"
                      value={updatedStock[record._id] ?? stockData[record._id] ?? 0}
                      onChange={(e) => handleStockChange(e.target.value, record._id)}
                      style={{ width: "80px" }}
                      disabled={!editableRows[record._id]}
                    />
                    <Button
                      type="link"
                      onClick={() => handleUpdateClick(record._id)}
                      disabled={editableRows[record._id]}
                    >
                      Update
                    </Button>
                  </div>
                ),
              },
            ]}
            pagination={false}
          />

          <Button
            type="primary"
            onClick={handleSaveStock}
            style={{ marginTop: "20px" }}
            disabled={Object.keys(updatedStock).length === 0}
          >
            Save Stock
          </Button>
        </>
      ) : (
        <p>No menu items available for this restaurant.</p>
      )}
    </div>
  );
};

export default InventoryManagement;
