import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";

const FrozenFood = ({ frozenFoodData, onSubmit }) => {
  const [loading, setLoading] = useState(false);

  // Check if it's in edit mode based on frozenFoodData
  const isEditing = frozenFoodData && Object.keys(frozenFoodData).length > 0;

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);
    console.log("Frozen food details:", values);

    try {
      let response;
      const endpoint = isEditing
        ? `http://localhost:4001/api/editFrozenFood/${frozenFoodData._id}` // Ensure it's _id here
        : "http://localhost:4001/api/addFrozenFood"; // For adding new frozen food item

      // Make POST or PUT request based on editing or adding
      if (isEditing) {
        response = await axios.put(endpoint, values);
        message.success("Frozen food details updated successfully!");
      } else {
        response = await axios.post(endpoint, values);
        message.success("Frozen food details added successfully!");
      }

      // Handle successful response
      if (response.status === 200 || response.status === 201) {
        if (onSubmit) onSubmit(response.data); // Callback with the updated frozen food data
      }
    } catch (error) {
      message.error("Error submitting frozen food details.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        name: frozenFoodData?.name || "", // Pre-fill name
        hsnCode: frozenFoodData?.hsnCode || "", // Pre-fill hsn code
        id: frozenFoodData?._id || "", // Pre-fill frozenFoodId for editing
      }}
    >
      {/* Frozen Food ID */}
      <Form.Item
        name="id"
        label="Product ID"
        rules={[{ required: true, message: "Please enter the id" }]}

        hidden={isEditing} // Hide when adding new frozen food
      >
        <Input placeholder="Product ID" disabled={isEditing} />
      </Form.Item>

      {/* Name */}
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: "Please enter the Product name" }]}
      >
        <Input placeholder="Enter Product name" />
      </Form.Item>

      {/* HSN Code */}
      <Form.Item
        name="hsnCode"
        label="HSN Code"
        rules={[
          { 
            required: true, 
            message: "Please enter the HSN code" 
          },
          {
            pattern: /^[0-9]+$/, // Only numbers
            message: "HSN Code must be a number",
          },
        ]}
      >
        <Input placeholder="Enter HSN code" />
      </Form.Item>

      {/* Submit Button */}
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {isEditing ? "Update Frozen Food" : "Add Frozen Food"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default FrozenFood;
