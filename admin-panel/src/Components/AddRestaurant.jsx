import React, { useEffect } from "react";
import { Form, Input, Select, Upload, Button, message } from "antd";
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

    const finalRestaurantId = isEditing ? restaurantData._id : restaurantId || generateRestaurantId();
    const uploadedFile = restValues.img && restValues.img[0]?.originFileObj ? restValues.img[0].originFileObj : null;

    try {
      const formData = new FormData();
      Object.keys(restValues).forEach((key) => {
        if (key !== "img") {
          formData.append(key, restValues[key]);
        }
      });

      // Append the restaurantId and vendorId
      formData.append("restaurantId", finalRestaurantId);
      formData.append("vendorId", localStorage.getItem("vendorId")); // Get vendorId from local storage

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

  const generateRestaurantId = () => {
    return 'restaurant-' + Math.random().toString(36).substr(2, 9);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
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

      <Form.Item
        name="type"
        label="Type"
        rules={[{ required: true, message: "Please select the restaurant type" }]} >
        <Select placeholder="Select type">
          <Option value="Frozen Foods">Frozen Foods</Option>
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