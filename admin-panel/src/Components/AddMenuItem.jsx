import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Select, Upload, Button, Space, message } from "antd";
import { UploadOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import axios from "./Services/Api"; 

const { Option } = Select;

const AddMenuItem = ({ menuItemData, onUpdateSuccess }) => {
  const [form] = Form.useForm();
  const [vendors, setVendors] = useState([]);
  const [types] = useState(["Veg", "Non-Veg", "SeekhKebab"]);
  const isEditing = !!menuItemData;

  const role = localStorage.getItem("role");
  const vendorId = localStorage.getItem("vendorId")?.trim();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get("/getVendor");

        if (!response?.data) {
          console.error("No data received from API");
          return;
        }

        let filteredVendors = response.data;

        if (role !== "admin" && vendorId) {
          filteredVendors = response.data.filter((vendor) => vendor._id.trim() === vendorId);
        }

        setVendors(filteredVendors);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        message.error("Failed to fetch vendors.");
      }
    };

    fetchVendors();

    if (isEditing) {
      form.setFieldsValue({
        ...menuItemData,
        img: menuItemData.imgPath
          ? [
              {
                uid: "-1",
                name: "existing-image",
                status: "done",
                url: `https://dev.digitalexamregistration.com${menuItemData.imgPath}`,
              },
            ]
          : [],
        addOns: menuItemData.addOns || [],
        vendorId: menuItemData.vendorId,
        price: menuItemData.price || 0,
      });
    } else {
      form.setFieldsValue({ price: 0 });
    }
  }, [form, isEditing, menuItemData, role, vendorId]);

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append("vendorId", values.vendorId);
      formData.append("name", values.name);
      formData.append("type", values.type);
      formData.append("description", values.description);
      formData.append("price", values.price);
      formData.append("addOns", JSON.stringify(values.addOns || []));

      if (values.img && values.img[0]?.originFileObj) {
        formData.append("imgPath", values.img[0].originFileObj);
      }

      const response = await axios.post("/addMenuItem", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Menu item added successfully");
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (error) {
      console.error("Error adding menu item:", error);
      message.error("Failed to add menu item.");
    }
  };

  return (
    <div style={{ padding: "10px"}}>
      <h1>Add Menu Item</h1>
    <Form form={form} layout="vertical" onFinish={onFinish}>
      {/* Vendor Dropdown */}
      <Form.Item
        name="vendorId"
        label="Vendor"
        rules={[{ required: true, message: "Please select the vendor" }]}
      >
        <Select placeholder="Select vendor">
          {vendors.map((vendor) => (
            <Option key={vendor._id} value={vendor._id}>
              {vendor.vendorName}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Remaining Fields (Unchanged) */}
      <Form.Item
        name="name"
        label="Menu Item Name"
        rules={[{ required: true, message: "Please enter the menu item name" }]}
      >
        <Input placeholder="Enter menu item name" />
      </Form.Item>

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

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: "Please enter the description" }]}
      >
        <Input.TextArea placeholder="Enter description" />
      </Form.Item>

      <Form.Item
        name="price"
        label="Price"
        rules={[{ required: true, message: "Please enter the price" }]}
      >
        <InputNumber min={0} placeholder="Enter price" />
      </Form.Item>

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
                  <InputNumber min={0} placeholder="Price" />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} style={{ width: "60%" }}>
              Add Add-on
            </Button>
          </>
        )}
      </Form.List>

      <Form.Item
        name="img"
        label="Upload Image"
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
      >
        <Upload name="imgPath" listType="picture" beforeUpload={() => false}>
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {isEditing ? "Update Menu Item" : "Add Menu Item"}
        </Button>
      </Form.Item>
    </Form>
    </div>
  );
};

export default AddMenuItem;
