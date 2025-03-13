import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Select, Upload, Button, Space, message } from "antd";
import { UploadOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import axios from "./Services/Api"; // Correct import
const { Option } = Select;

const AddMenuItem = ({ menuItemData, onUpdateSuccess }) => {
  const [form] = Form.useForm();
  const [restaurants, setRestaurants] = useState([]);
  const [types] = useState(["Veg", "Non-Veg", "SeekhKebab"]);
  const isEditing = !!menuItemData;

  // Retrieve vendorId from local storage
  const vendorId = localStorage.getItem('vendorId');

  useEffect(() => {
    console.log("Vendor ID in AddMenuItem:", vendorId); // Debugging statement

    // Fetch restaurants for dropdown
    const fetchRestaurants = async () => {
      try {
        const { data } = await axios.get("/getRestaurant");
        console.log("Fetched restaurants:", data); // Log the fetched data

        // Filter restaurants based on vendorId
        const filteredRestaurants = data.filter(restaurant => restaurant.vendorId === vendorId);
        console.log("Filtered restaurants:", filteredRestaurants); // Log the filtered data

        setRestaurants(filteredRestaurants);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        message.error("Failed to fetch restaurants.");
      }
    };

    fetchRestaurants();

    if (isEditing) {
      form.setFieldsValue({
        ...menuItemData,
        img: menuItemData.imgPath
          ? [
              {
                uid: "-1",
                name: "existing-image",
                status: "done",
                url: `https://dev.digitalexamregistration.com${menuItemData.imgPath}`, // Ensure full URL
              },
            ]
          : [],
        addOns: menuItemData.addOns || [],
        restaurantId: menuItemData.restaurantId,
        price: menuItemData.price || 0, // Set default price to 0
      });
    } else {
      form.setFieldsValue({
        price: 0, // Set default price to 0 when adding a new item
      });
    }
  }, [form, isEditing, menuItemData, vendorId]);

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append("restaurantId", values.restaurantId);
      formData.append("name", values.name);
      formData.append("type", values.type);
      formData.append("description", values.description);
      formData.append("price", values.price);
      formData.append("addOns", JSON.stringify(values.addOns || []));
  
      if (values.img && values.img[0]?.originFileObj) {
        formData.append("img", values.img[0].originFileObj);
      } else {
        console.error("Image file not found in form values.");
      }
  
      const response = await axios.post("/addMenuItem", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      message.success("Menu item added successfully");
      console.log("Menu item added successfully:", response.data);
      if (onUpdateSuccess) onUpdateSuccess(); // Call the success callback if provided
    } catch (error) {
      console.error("Error adding menu item:", error);
      message.error("Failed to add menu item.");
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      {/* Restaurant Dropdown */}
      <Form.Item
        name="restaurantId"
        label="Restaurant"
        rules={[{ required: true, message: "Please select the restaurant" }]}
      >
        <Select placeholder="Select restaurant">
          {restaurants.map((restaurant) => (
            <Option key={restaurant._id} value={restaurant._id}>
              {restaurant.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Menu Item Name */}
      <Form.Item
        name="name"
        label="Menu Item Name"
        rules={[{ required: true, message: "Please enter the menu item name" }]}
      >
        <Input placeholder="Enter menu item name" />
      </Form.Item>

      {/* Menu Item Type - Dropdown */}
      <Form.Item
        name="type"
        label="Type"
        rules={[{ required: true, message: "Please select the item type" }]}
      >
        <Select placeholder="Select type">
          {types.map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Description */}
      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: "Please enter the description" }]}
      >
        <Input.TextArea placeholder="Enter description" />
      </Form.Item>

      {/* Price */}
      <Form.Item
        name="price"
        label="Price"
        rules={[{ required: true, message: "Please enter the price" }]}
      >
        <InputNumber 
          min={0} 
          placeholder="Enter price" 
        />
      </Form.Item>

      {/* Add-ons */}
      <Form.List name="addOns">
        {(fields, { add, remove }) => (
          <>
            <label>Add-ons</label>
            {fields.map(({ key, name, fieldKey, ...restField }) => (
              <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, "name"]}
                  fieldKey={[fieldKey, "name"]}
                  rules={[{ required: true, message: "Missing add-on name" }]}
                >
                  <Input placeholder="Add-on name" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "price"]}
                  fieldKey={[fieldKey, "price"]}
                  rules={[{ required: true, message: "Missing add-on price" }]}
                >
                  <InputNumber 
                    min={0} 
                    placeholder="Price" 
                    onKeyPress={(e) => {
                      // Allow only numbers and decimal point
                      if (!/[0-9.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }} 
                  />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
              
            ))}
            <Button
              type="dashed"
              onClick={() => add()}
              icon={<PlusOutlined />}
              style={{ width: "60%" }}
            >
              Add Add-on
            </Button>
          </>
        )}
      </Form.List>

      {/* Image Upload */}
      <Form.Item
        name="img"
        label="Upload Image"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
      >
        <Upload
          name="img"
          listType="picture"
          beforeUpload={() => false} // Prevent immediate upload
        >
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {isEditing ? "Update Menu Item" : "Add Menu Item"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddMenuItem;