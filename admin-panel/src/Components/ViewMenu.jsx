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
      const { data } = await axios.get('/getRestaurant');
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      message.error('Failed to fetch restaurants.');
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
    setAddOns(item.addOns || []); // Load addOns if they exist
    setFileList(item.imgPath ? [{ url: `https://dev.digitalexamregistration.com/api/${item.imgPath}` }] : []);
  };

  const handleSubmitEdit = async (values) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('price', values.price);
    formData.append('description', values.description);
    formData.append('addOns', JSON.stringify(addOns)); // Include addOns in the form data

    // Check if a new image is uploaded and append it
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('img', fileList[0].originFileObj);
    }

    try {
      const response = await axios.put(`/updateMenuItem/${editingItem._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      message.success('Menu item updated successfully');

      // Update the local state with the edited item
      setMenuItems(menuItems.map(item =>
        item._id === editingItem._id
          ? { ...item, ...values, addOns, imgPath: response.data.imgPath || item.imgPath }
          : item
      ));

      setEditingItem(null);
      form.resetFields();
      setFileList([]);
      setAddOns([]); // Reset addOns
    } catch (error) {
      console.error('Error updating menu item:', error);
      message.error('Failed to update menu item.');
    }
  };

  const handleAddAddOn = () => {
    setAddOns([...addOns, { name: '', price: 0 }]); // Add a blank addOn with name and price
  };

  const handleRemoveAddOn = (index) => {
    const updatedAddOns = addOns.filter((_, i) => i !== index);
    setAddOns(updatedAddOns);
  };

  const handleAddOnChange = (value, field, index) => {
    const updatedAddOns = [...addOns];
    updatedAddOns[index][field] = value; // Update the specific field (name or price)
    setAddOns(updatedAddOns);
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
                src={`https://dev.digitalexamregistration.com/api/${restaurant.imgPath}`} // Restaurant image path
                alt={restaurant.name}
                style={{ width: '30%', height: '75px', objectFit: 'cover' }} // Adjust image size and fit
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
                        <Button
                          type="danger"
                          style={{ border: "1px solid red" , color:"red"}}
                        >
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
          <button
            style={{ marginTop: '20px' }}
            onClick={() => setSelectedRestaurant(null)}
          >
            Back to Restaurants
          </button>
        </>
      )}

      {/* Edit Menu Item Modal */}
      <Modal
        visible={editingItem !== null}
        title={`Edit ${editingItem?.name}`}
        onCancel={() => {
          setEditingItem(null);
          form.resetFields();
          setFileList([]); // Reset file list
          setAddOns([]); // Reset addOns
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmitEdit}
          initialValues={{
            name: editingItem?.name,
            price: editingItem?.price,
            description: editingItem?.description,
            imgPath: editingItem?.imgPath,
          }}
        >
          <Form.Item
            name="name"
            label="Item Name"
            rules={[{ required: true, message: 'Please enter the item name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter the price' }]}
          >
            <InputNumber 
              min={0} 
              onKeyPress={(e) => {
                // Allow only numbers and decimal point
                if (!/[0-9.]/.test(e.key)) {
                  e.preventDefault();
                }
              }} 
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter the description' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="imgPath" label="Image">
            <Upload
              listType="picture"
              beforeUpload={() => false} // Prevent auto upload
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
            >
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
            {fileList.length > 0 && fileList[0].url && (
              <img
                src={fileList[0].url}
                alt="Menu Item"
                style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px' }}
              />
            )}
          </Form.Item>

          {/* Add-ons */}
          <Form.Item label="Add-Ons">
            <Button type="dashed" onClick={handleAddAddOn}>Add Add-On</Button>
            <div style={{ marginTop: '10px' }}>
              {addOns.map((addOn, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <Input
                    value={addOn.name}
                    onChange={(e) => handleAddOnChange(e.target.value, 'name', index)}
                    placeholder="Add-On Name"
                    style={{ width: '40%' }}
                  />
                  <InputNumber
                    value={addOn.price}
                    onChange={(value) => handleAddOnChange(value, 'price', index)}
                    placeholder="Price"
                    min={0}
                    style={{ width: '40%', marginLeft: '10px' }}
                    onKeyPress={(e) => {
                      // Allow only numbers and decimal point
                      if (!/[0-9.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }} 
                  />
                  <Popconfirm
                    title="Are you sure you want to remove this add-on?"
                    onConfirm={() => handleRemoveAddOn(index)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="danger"
                      style={{ marginLeft: '10px' }}
                    >
                      Remove
                    </Button>
                  </Popconfirm>
                </div>
              ))}
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ViewMenu;