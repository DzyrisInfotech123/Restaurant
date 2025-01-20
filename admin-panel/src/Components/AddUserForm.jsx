import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import axios from './Services/Api';  // Ensure Axios is set up properly

const AddUserForm = ({ loggedInUser }) => {
  const [form] = Form.useForm();
  const [vendors, setVendors] = useState([]);  // To hold the list of vendors
  const [role, setRole] = useState('');  // Track selected role

  useEffect(() => {
    // Fetch vendors list (you might already have this list from your backend API)
    const fetchVendors = async () => {
      try {
        const response = await axios.get('https://dev.digitalexamregistration.com/api/getVendor');
        setVendors(response.data);  // Assuming the response contains a list of vendors
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };

    fetchVendors();
  }, []);

  const onFinish = async (values) => {
    try {
      const { username, password, role, vendorId } = values; // Include vendorId
      const response = await axios.post('https://dev.digitalexamregistration.com/api/addUser', { username, password, role, vendorId });
      message.success('User added successfully!');
      form.resetFields(); // Reset the form after successful submission
    } catch (error) {
      console.error('API Error:', error);
      message.error('Failed to add user. Please try again.');
    }
  };

  const handleRoleChange = (value) => {
    setRole(value);  // Update role when user changes the role
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="username" label="Username" rules={[{ required: true }]}>
        <Input placeholder="Enter username" />
      </Form.Item>

      <Form.Item name="password" label="Password" rules={[{ required: true }]}>
        <Input.Password placeholder="Enter password" />
      </Form.Item>

      <Form.Item name="role" label="Role" rules={[{ required: true }]}>
        <Select placeholder="Select role" onChange={handleRoleChange}>
          <Select.Option value="admin">Admin</Select.Option>
          <Select.Option value="vendor">Vendor</Select.Option> {/* Add Vendor option */}
        </Select>
      </Form.Item>

      {/* Vendor Dropdown (Appears only if the role is "vendor") */}
      {role === 'vendor' && (
        <Form.Item name="vendorId" label="Vendor" rules={[{ required: true }]}>
          <Select placeholder="Select vendor">
            {vendors.map((vendor) => (
              <Select.Option key={vendor._id} value={vendor._id}>
                {vendor.vendorName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}

      <Button type="primary" htmlType="submit">
        Add User
      </Button>
    </Form>
  );
};

export default AddUserForm;
