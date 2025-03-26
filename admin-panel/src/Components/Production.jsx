import React, { useState, useEffect } from 'react';
import { Collapse, Button, Modal, Form, Input, DatePicker, Select, List, message, InputNumber } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from './Services/Api';

const { Option } = Select;
const { Panel } = Collapse;

const Production = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [productionId, setProductionId] = useState('');
  const [productionEntries, setProductionEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRestaurants();
    fetchProductionEntries();
  }, []);

  useEffect(() => {
    if (restaurants.length > 0) {
      setSelectedRestaurant(restaurants[0]._id);
      fetchMenuItems(restaurants[0]._id);
    }
  }, [restaurants]);

  useEffect(() => {
    const filtered = menuItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMenuItems(filtered);
  }, [searchTerm, menuItems]);

  const getVendorId = () => {
    const vendorId = localStorage.getItem("vendorId");
    if (!vendorId) {
      message.error("Vendor ID is missing. Please log in again.");
      console.error("Vendor ID not found in localStorage");
      return null;
    }
    return vendorId;
  };

  const fetchRestaurants = async () => {
    const vendorId = getVendorId();
    if (!vendorId) return;
  
    const userRole = localStorage.getItem("role"); // Fetch user role from localStorage
  
    try {
      let url = `/getRestaurants?vendorId=${vendorId}`;
  
      if (userRole === "admin") {
        url += "&default=true"; // Fetch only default restaurants for admins
      }
  
      const { data } = await axios.get(url);
      setRestaurants(data);
    } catch (error) {
      message.error("Failed to fetch restaurants.");
      console.error("Error fetching restaurants:", error);
    }
  };
  
  const fetchMenuItems = async (restaurantId) => {
    if (!restaurantId) return;

    try {
      const { data } = await axios.get(`/getMenuItems?restaurantId=${restaurantId}`);
      setMenuItems(data);
      setFilteredMenuItems(data);
    } catch (error) {
      message.error("Failed to fetch menu items.");
      console.error("Error fetching menu items:", error);
    }
  };

  const fetchProductionEntries = async () => {
    const vendorId = getVendorId();
    if (!vendorId) return;

    try {
      const { data } = await axios.get(`/getProduction?vendorId=${vendorId}`);
      if (Array.isArray(data)) {
        setProductionEntries(data);
      } else {
        message.error("Invalid data format received.");
      }
    } catch (error) {
      message.error("Failed to fetch production entries.");
      console.error("Error fetching production entries:", error);
    }
  };

  const generateProductionId = async () => {
  const vendorId = getVendorId();
  if (!vendorId) return;

  try {
    // Ensure we are fetching productions only for the logged-in vendor
    const { data } = await axios.get(`/getProductions?vendorId=${vendorId}`);
    
    // If no entries exist, start with 1
    const nextEntryCount = Array.isArray(data) && data.length > 0 ? data.length + 1 : 1;

    const date = new Date();
    const monthAbbr = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = date.getFullYear().toString().slice(-2);
    const newProductionId = `DZY${monthAbbr}${year}${nextEntryCount.toString().padStart(2, '0')}`;

    setProductionId(newProductionId);
  } catch (error) {
    message.error("Failed to generate production ID.");
    console.error("Error generating production ID:", error);
    setProductionId("DZY0001"); // Fallback Production ID
  }
};

  
  const handleAddClick = async () => {
    await generateProductionId();
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    form.resetFields();
    setFilteredMenuItems(menuItems);
    setQuantities({});
    setSearchTerm(""); // Reset search field on modal close
  };

  const handleRestaurantChange = (value) => {
    setSelectedRestaurant(value);
    fetchMenuItems(value);
  };

  const handleQuantityChange = (itemId, value) => {
    setQuantities(prev => ({ ...prev, [itemId]: value }));
  };

  const handleSubmit = async (values) => {
    const vendorId = getVendorId();
    if (!vendorId) return;

    if (!selectedRestaurant) {
      message.error("Please select a restaurant before submitting.");
      return;
    }

    const newEntry = {
      date: values.date.format('DD/MM/YY'),
      productionid: productionId,
      batch: values.batch,
      restaurantId: selectedRestaurant,
      vendorId,
      quantities,
    };

    try {
      await axios.post('/addproduction', newEntry);
      message.success("Production entry saved successfully!");
      handleModalClose();
      fetchProductionEntries();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to save production entry.");
      console.error("Error saving production entry:", error);
    }
  };

  return (
    <div>
      <Button type="primary" onClick={handleAddClick}>ADD +</Button>

      <Collapse accordion>
        {productionEntries.length > 0 ? (
          productionEntries.map((entry, index) => (
            <Panel
              key={entry._id || index}
              header={
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <span><strong>🔢 S.No:</strong> {index + 1}</span>
                  <span><strong>📆 Date:</strong> {entry.date}</span>
                  <span><strong>🆔 Production ID:</strong> {entry.productionid}</span>
                  <span><strong>#️⃣ Batch:</strong> {entry.batch}</span>
                </div>
              }
            >
              <h4>Menu Items & Quantities</h4>
              {entry.quantities && typeof entry.quantities === "object" ? (
                <ul>
                  {Object.entries(entry.quantities).map(([itemName, quantity]) => (
                    <li key={itemName}>{itemName}: {quantity} Kg</li>
                  ))}
                </ul>
              ) : (
                <p>No quantities found.</p>
              )}
            </Panel>
          ))
        ) : (
          <p>No production entries available.</p>
        )}
      </Collapse>

      <Modal title="Add Production Entry" open={isModalOpen} onCancel={handleModalClose} footer={null} width={900}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Production Id" name="productionid" initialValue={productionId} rules={[{ required: true }]}><Input disabled /></Form.Item>
          <Form.Item label="Date" name="date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="Batch Code" name="batch" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Restaurant" name="restaurant" rules={[{ required: true }]}><Select placeholder="Select Restaurant" onChange={handleRestaurantChange} value={selectedRestaurant}>{restaurants.map(restaurant => (<Option key={restaurant._id} value={restaurant._id}>{restaurant.name}</Option>))}</Select></Form.Item>
          
          {/* Search Bar */}
          <Input
  placeholder="Search menu item..."
  onChange={(e) => setSearchTerm(e.target.value)}
  style={{ marginBottom: "10px", width: "100%" }}
  prefix={<SearchOutlined style={{ color: "rgba(0,0,0,0.45)" }} />}
/>

          <List bordered dataSource={filteredMenuItems} renderItem={(item) => (
            <List.Item style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{item.name}</span>
              <InputNumber min={1} placeholder="Quantity in kgs" onChange={(value) => handleQuantityChange(item._id, value)} style={{ width: "200px" }} />
            </List.Item>
          )} />

          <Button type="primary" htmlType="submit">Add Production</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Production;
