import React, { useState, useEffect } from 'react';
import { Card, Table, message, Modal, Form, Input, InputNumber, Button, Upload, Popconfirm } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from './Services/Api';

const ViewMenu = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [addOns, setAddOns] = useState([]); // Track add-ons for the editing item

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const vendorId = localStorage.getItem("vendorId"); // Get vendorId from local storage
      const role = localStorage.getItem("role"); // Get user role from local storage

      let { data: vendorRestaurants } = await axios.get(`/getRestaurant?vendorId=${vendorId}`); // Fetch vendor restaurants

      let allRestaurants = [];
      if (role === "admin") {
        // If user is admin, fetch all restaurants
        const response = await axios.get(`/getRestaurant`);
        allRestaurants = response.data.filter((restaurant) => restaurant.default === "true");
      }

      // Merge default restaurants with vendor-specific ones, avoiding duplicates
      const mergedRestaurants = [...vendorRestaurants, ...allRestaurants].filter(
        (restaurant, index, self) =>
          index === self.findIndex((r) => r._id === restaurant._id) // Ensure unique restaurants
      );

      setRestaurants(mergedRestaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      message.error("Failed to fetch restaurants.");
    }
  };

  const fetchMenuItems = async (restaurantId) => {
    try {
      const { data } = await axios.get(`/getMenuItems?restaurantId=${restaurantId}`);
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      message.error('Failed to fetch menu items.');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue({
      name: item.name,
      price: item.price,
      description: item.description,
    });
    setAddOns(item.addOns || []);
    setFileList(item.imgPath ? [{ url: `https://dev.digitalexamregistration.com/api/${item.imgPath}` }] : []);
  };

  const handleSubmitEdit = async (values) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('price', values.price);
    formData.append('description', values.description);
    formData.append('addOns', JSON.stringify(addOns));

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('img', fileList[0].originFileObj);
    }

    try {
      const response = await axios.put(`/updateMenuItem/${editingItem._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      message.success('Menu item updated successfully');
      setMenuItems(menuItems.map(item =>
        item._id === editingItem._id ? { ...item, ...values, addOns, imgPath: response.data.imgPath || item.imgPath } : item
      ));

      setEditingItem(null);
      form.resetFields();
      setFileList([]);
      setAddOns([]);
    } catch (error) {
      console.error('Error updating menu item:', error);
      message.error('Failed to update menu item.');
    }
  };

  const handleDeleteMenuItem = async (id) => {
    try {
      await axios.delete(`/deleteMenuItem/${id}`);
      message.success('Menu item deleted successfully');
      setMenuItems(menuItems.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      message.error('Failed to delete menu item.');
    }
  };

  return (
    <>
      <h2>View Menu</h2>
      {!selectedRestaurant ? (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {restaurants.map((restaurant) => (
            <Card
              key={restaurant._id}
              title={restaurant.name}
              bordered
              style={{ width: 300 }}
              onClick={() => {
                setSelectedRestaurant(restaurant);
                fetchMenuItems(restaurant._id);
              }}
            >
              <img
                src={`https://dev.digitalexamregistration.com/api/${restaurant.imgPath}`}
                alt={restaurant.name}
                style={{ width: '30%', height: '75px', objectFit: 'cover' }}
              />
              <p>Click to view menu</p>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <h3>{selectedRestaurant.name} - Menu</h3>
          <img
            src={`https://dev.digitalexamregistration.com/api/${selectedRestaurant.imgPath}`}
            alt={selectedRestaurant.name}
            style={{ width: '14%', height: '155px', objectFit: 'cover' }}
          />
          {menuItems.length > 0 ? (
            <Table
              dataSource={menuItems.map((item, index) => ({
                ...item,
                key: index,
              }))}
              columns={[
                {
                  title: 'Image',
                  dataIndex: 'imgPath',
                  key: 'imgPath',
                  render: (imgPath) => (
                    <img
                      src={`https://dev.digitalexamregistration.com/api/${imgPath}`}
                      alt="Menu Item"
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                  ),
                },
                { title: 'Item', dataIndex: 'name', key: 'name' },
                { title: 'Price', dataIndex: 'price', key: 'price' },
                { title: 'Description', dataIndex: 'description', key: 'description' },
                {
                  title: 'Action',
                  key: 'action',
                  render: (text, record) => (
                    <div style={{ display: 'inline-flex', gap: '10px' }}>
                      <Button onClick={() => handleEdit(record)}>Edit</Button>
                      <Popconfirm
                        title="Are you sure you want to delete this item?"
                        onConfirm={() => handleDeleteMenuItem(record._id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button type="danger" style={{ border: "1px solid red", color: "red" }}>
                          Delete
                        </Button>
                      </Popconfirm>
                    </div>
                  ),
                },
              ]}
              pagination={false}
            />
          ) : (
            <p>No menu available for this restaurant.</p>
          )}
          <button style={{ marginTop: '20px' }} onClick={() => setSelectedRestaurant(null)}>
            Back to Restaurants
          </button>
        </>
      )}
    </>
  );
};

export default ViewMenu;
