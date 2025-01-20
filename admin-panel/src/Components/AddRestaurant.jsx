import React, { useEffect } from "react";
import { Form, Input, InputNumber, Select, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "./Services/Api";

const { Option } = Select;

const AddRestaurant = ({ restaurantData, onUpdateSuccess }) => {
  const [form] = Form.useForm();
  const isEditing = !!restaurantData;

  useEffect(() => {
    if (isEditing) {
      form.setFieldsValue({
        ...restaurantData,
        img: restaurantData.imgPath
          ? [
              {
                uid: "-1",
                name: "existing-image",
                status: "done",
                url: `https://dev.digitalexamregistration.com${restaurantData.imgPath}`, // Ensure full URL
              },
            ]
          : [],
      });
    }
  }, [restaurantData, form, isEditing]);

  const onFinish = async (values) => {
    const { restaurantId, ...restValues } = values;

    // Use the provided restaurantId (or generate if missing for new restaurants)
    const finalRestaurantId = isEditing ? restaurantData._id : restaurantId || generateRestaurantId();

    const uploadedFile =
      restValues.img && restValues.img[0]?.originFileObj ? restValues.img[0].originFileObj : null;

    try {
      const formData = new FormData();
      Object.keys(restValues).forEach((key) => {
        if (key !== "img") {
          formData.append(key, restValues[key]);
        }
      });

      // Append the restaurantId manually
      formData.append("restaurantId", finalRestaurantId);

      if (uploadedFile) {
        formData.append("img", uploadedFile);
      }

      const endpoint = isEditing
        ? `https://dev.digitalexamregistration.com/api/editRestaurant/${restaurantData._id}`
        : "https://dev.digitalexamregistration.com/api/addRestaurant";

      const method = isEditing ? "put" : "post";

      await axios[method](endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success(
        isEditing ? "Restaurant updated successfully!" : "Restaurant added successfully!"
      );

      form.resetFields();
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "adding"} restaurant:`, error);
      message.error(`Failed to ${isEditing ? "update" : "add"} restaurant. Please try again.`);
    }
  };

  // Function to generate a unique restaurantId if needed (only for new restaurants)
  const generateRestaurantId = () => {
    return 'restaurant-' + Math.random().toString(36).substr(2, 9);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      {/* Restaurant ID field */}
      <Form.Item
        name="restaurantId"
        label="Restaurant ID"
        initialValue={isEditing ? restaurantData._id : ''}
        rules={[{ required: true, message: "Please enter a restaurant ID" }]}
      >
        <Input 
          disabled={isEditing} // Disable if in editing mode
          placeholder="Restaurant ID (editable for new restaurants)" 
        />
      </Form.Item>

      <Form.Item
        name="name"
        label="Restaurant Name"
        rules={[{ required: true, message: "Please enter the restaurant name" }]} >
        <Input placeholder="Enter restaurant name" />
      </Form.Item>

      {/* <Form.Item
        name="rating"
        label="Rating"
        rules={[{ required: true, message: "Please enter the restaurant rating" }]} >
        <InputNumber min={0} max={5} placeholder="Enter rating" />
      </Form.Item>

      <Form.Item
        name="reviews"
        label="Reviews"
        rules={[{ required: true, message: "Please enter the number of reviews" }]} >
        <InputNumber min={0} placeholder="Enter number of reviews" />
      </Form.Item> */}

      <Form.Item
        name="type"
        label="Type"
        rules={[{ required: true, message: "Please select the restaurant type" }]} >
        <Select placeholder="Select type">
          <Option value="Burger">Burger</Option>
          <Option value="Pizza">Pizza</Option>
          <Option value="Coffee">Coffee</Option>
          <Option value="Ice Cream">Ice Cream</Option>
          <Option value="Fried Chicken">Fried Chicken</Option>
          <Option value="Momos">Momos</Option>
          <Option value="Tacos">Tacos</Option>
          <Option value="Indian">Indian</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="price"
        label="Price"
        rules={[{ required: true, message: "Please enter the price range" }]} >
        <Input placeholder="Enter price range (e.g., 200 ₹ -500 ₹)" />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: "Please select the restaurant status" }]} >
        <Select placeholder="Select status">
          <Option value="Open">Open</Option>
          <Option value="Closed">Closed</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="img"
        label="Upload Image"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)} >
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
          {isEditing ? "Update Restaurant" : "Add Restaurant"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddRestaurant;
