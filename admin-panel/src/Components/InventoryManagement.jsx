import React, { useState, useEffect } from "react";
import { Select, Table, Input, Button, message } from "antd";
import axios from "./Services/Api";

const InventoryManagement = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [stockData, setStockData] = useState({});
  const [updatedStock, setUpdatedStock] = useState({});
  const [editableRows, setEditableRows] = useState({});

  useEffect(() => {
    fetchRestaurants();
    fetchUnprocessedOrders(); // Fetch only unprocessed orders
  }, []);

  const fetchRestaurants = async () => {
    try {
      const vendorId = localStorage.getItem("vendorId");
      const { data } = await axios.get(`/getRestaurant?vendorId=${vendorId}`);
      setRestaurants(data);
    } catch (error) {
      message.error("Failed to fetch restaurants.");
    }
  };

  const fetchMenuItems = async (restaurantId) => {
    try {
      const vendorId = localStorage.getItem("vendorId");

      const { data: menuItemsData } = await axios.get(`/getMenuItems?restaurantId=${restaurantId}`);
      setMenuItems(menuItemsData);

      // Fetch stock data from DB
      const { data: stockResponse } = await axios.get(`/getStock?vendorId=${vendorId}&restaurantId=${restaurantId}`);
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
      const vendorId = localStorage.getItem("vendorId");

      if (!vendorId || !selectedRestaurant) {
        message.error("Vendor or restaurant selection is missing.");
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
        vendorId,
        restaurantId: selectedRestaurant,
        stockUpdates,
      });

      message.success("Stock updated successfully!");
      fetchMenuItems(selectedRestaurant);
    } catch (error) {
      message.error("Failed to update stock.");
    }
  };

  const fetchUnprocessedOrders = async () => {
    try {
      const vendorId = localStorage.getItem("vendorId");
  
      // Fetch only unprocessed orders (processed=false)
      const { data: orders } = await axios.get(`/getOrders?vendorId=${vendorId}&processed=false`);
  
      for (const order of orders) {
        for (const item of order.cart) {
          await updateStockOnOrder(item, order.priceType);
        }
  
        // ✅ Mark order as processed **after stock update**
        await axios.post(`/markOrderProcessed`, { orderId: order._id });
      }
    } catch (error) {
      message.error("Failed to fetch orders.");
    }
  };
  

  const updateStockOnOrder = async (orderItem, orderType) => {
    try {
      const vendorId = localStorage.getItem("vendorId");
      const restaurantId = orderItem.restaurantId;
      const itemId = orderItem._id;
      const quantity = orderItem.quantity;

      // Get the latest stock from DB
      const { data: stockResponse } = await axios.get(`/getStock?vendorId=${vendorId}&restaurantId=${restaurantId}`);
      const currentStock = stockResponse.stock.find((stockItem) => stockItem.menuItemId._id === itemId)?.inStock || 0;

      let newStock = currentStock;
      if (orderType === "sale") {
        newStock = Math.max(0, currentStock - quantity);
      } else if (orderType === "purchase") {
        newStock = currentStock + quantity;
      }

      await axios.post(`/updateStock`, {
        vendorId,
        restaurantId,
        stockUpdates: [{ itemId, inStock: newStock }],
      });

      fetchMenuItems(restaurantId);
    } catch (error) {
      message.error("Failed to update stock based on order.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Select
        placeholder="Select a restaurant"
        style={{ width: 300, marginBottom: "20px" }}
        onChange={handleRestaurantChange}
      >
        {restaurants.map((restaurant) => (
          <Select.Option key={restaurant._id} value={restaurant._id}>
            {restaurant.name}
          </Select.Option>
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
                title: "In Stock",
                dataIndex: "inStock",
                key: "inStock",
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
