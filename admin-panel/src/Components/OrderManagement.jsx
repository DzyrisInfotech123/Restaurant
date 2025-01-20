import React, { useState, useEffect } from "react";
import { Card, Table, message, Modal, Form, Input, Button, Popconfirm } from "antd";
import axios from "./Services/Api";
import moment from "moment";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch all orders from the server
  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/getOrder");
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Failed to fetch orders.");
    }
  };

  // Handle search by order number
  const handleSearch = () => {
    if (!searchQuery) {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  };

  // Handle edit order
  const handleEdit = (order) => {
    setEditingOrder(order);
    form.setFieldsValue({
      orderNumber: order.orderNumber,
      status: order.status,
    });
  };

  // Submit edited order
  const handleSubmitEdit = async (values) => {
    try {
      await axios.put(`/updateOrder/${editingOrder._id}`, values);
      message.success("Order updated successfully");

      // Update local orders state
      setOrders(
        orders.map((order) =>
          order._id === editingOrder._id ? { ...order, ...values } : order
        )
      );

      setFilteredOrders(
        filteredOrders.map((order) =>
          order._id === editingOrder._id ? { ...order, ...values } : order
        )
      );

      setEditingOrder(null);
      form.resetFields();
    } catch (error) {
      console.error("Error updating order:", error);
      message.error("Failed to update order.");
    }
  };

  // Delete order
  const handleDeleteOrder = async (id) => {
    try {
      await axios.delete(`/deleteOrder/${id}`);
      message.success("Order deleted successfully");
      setOrders(orders.filter((order) => order._id !== id));
      setFilteredOrders(filteredOrders.filter((order) => order._id !== id));
    } catch (error) {
      console.error("Error deleting order:", error);
      message.error("Failed to delete order.");
    }
  };

  // Generate report (CSV example)
  const generateReport = () => {
    console.log("Generating report for orders:", filteredOrders);
  };

  return (
    <div>
      <h2>Admin Order Management</h2>

      {/* Search Bar */}
      <div style={{ marginBottom: "20px" }}>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Order Number"
          style={{ width: "300px", marginRight: "10px" }}
        />
        <Button onClick={handleSearch} type="primary">
          Search
        </Button>
      </div>

      {/* Generate Report Button */}
      <Button onClick={generateReport} type="secondary" style={{ marginBottom: "20px" }}>
        Generate Report
      </Button>

      {/* Order Table */}
      <Table
        dataSource={filteredOrders.map((order, index) => ({
          ...order,
          key: index,
        }))}
        columns={[
          { title: "Order Number", dataIndex: "orderNumber", key: "orderNumber" },
          {
            title: "Vendor Name",
            key: "vendorName",
            render: (_, record) => {
              // Get unique vendor names from the cart items
              const uniqueVendorNames = [...new Set(record.cart.map(item => item.vendorName))];
              return uniqueVendorNames.join(", ");
            },
          },
          { title: "Status", dataIndex: "status", key: "status" },
          {
            title: "Order Date",
            dataIndex: "orderDate",
            key: "orderDate",
            render: (text) => {
              const parsedDate = moment.utc(text).utcOffset(0); // Make sure it's treated as UTC without local timezone adjustment
              console.log("Parsed Date:", parsedDate.format("YYYY-MM-DD")); // Debugging log
              return parsedDate.format("YYYY-MM-DD"); // Format the date as YYYY-MM-DD
            }                       
          },
          {
            title: "Action",
            key: "action",
            render: (_, record) => (
              <div style={{ display: "inline-flex", gap: "10px" }}>
                <Button onClick={() => handleEdit(record)}>Edit</Button>
                <Popconfirm
                  title="Are you sure you want to delete this order?"
                  onConfirm={() => handleDeleteOrder(record._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="danger">Delete</Button>
                </Popconfirm>
              </div>
            ),
          },
        ]}
        pagination={false}
      />

      {/* Edit Order Modal */}
      <Modal
        visible={editingOrder !== null}
        title={`Edit Order - ${editingOrder?.orderNumber}`}
        onCancel={() => {
          setEditingOrder(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmitEdit}
          initialValues={{
            orderNumber: editingOrder?.orderNumber,
            status: editingOrder?.status,
          }}
        >
          <Form.Item label="Order Number" name="orderNumber">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Order Status"
            name="status"
            rules={[{ required: true, message: "Please enter the order status" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderManagement;
