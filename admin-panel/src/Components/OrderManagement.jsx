import React, { useState, useEffect } from "react";
import { message, Button, Modal, Form, Input, Popconfirm, InputNumber, Select } from "antd";
import { jsPDF } from "jspdf";
import "./OrderManagement.css";
import axios from "./Services/Api";
import {
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLocation } from "react-router-dom";
import moment from "moment";

const OrderManagement = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define status options
  const statusOptions = [
    { value: "booked", label: "Booked" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "packed", label: "Packed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const getDisabledStatuses = (selectedStatus) => {
    const statusOrder = statusOptions.map(option => option.value);
    const selectedIndex = statusOrder.indexOf(selectedStatus);
    return statusOrder.slice(0, selectedIndex);
  };

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
        order.priceType === "sale"
    );
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  const fetchOrders = async () => {
    try {
      const vendorId = localStorage.getItem("vendorId");

      if (!vendorId) {
        setError("Vendor ID is missing.");
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`/getOrder?vendorId=${vendorId}`);

      setOrders(data);
      setFilteredOrders(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders.");
      setLoading(false);
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    form.setFieldsValue({
      orderNumber: order.orderNumber,
      cart: order.cart || [],
      status: order.status || "booked",
    });
  };

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

  const handleSave = async (values) => {
    try {
      const existingOrder = orders.find(order => order.orderNumber === values.orderNumber);

      const updatedCart = values.cart.map((item, index) => {
        const existingItem = existingOrder.cart[index];
        return {
          ...existingItem,
          quantity: item.quantity,
          totalPrice: existingItem.price * item.quantity,
        };
      });

      const payload = {
        cart: updatedCart,
        subtotal: updatedCart.reduce((acc, item) => acc + item.totalPrice, 0),
        taxes: updatedCart.reduce((acc, item) => acc + item.totalPrice, 0) * 0.12,
        total: updatedCart.reduce((acc, item) => acc + item.totalPrice, 0) * 1.12,
        date: new Date().toISOString(),
        status: values.status,
      };

      const response = await axios.put(`/updateOrder/${values.orderNumber}`, payload);
      message.success("Order updated successfully");
      setOrders(orders.map((order) => (order.orderNumber === values.orderNumber ? response.data : order)));
      setFilteredOrders(filteredOrders.map((order) => (order.orderNumber === values.orderNumber ? response.data : order)));
      setEditingOrder(null);
      form.resetFields();
    } catch (error) {
      console.error("Error updating order:", error);
      message.error("Failed to update order.");
    }
  };

  const formatDate = (date) => {
    const parsedDate = moment(date);
    return parsedDate.isValid() ? parsedDate.format('MMMM DD, YYYY') : "Invalid Date";
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="search-bar">
        <Input
          placeholder="Search by Order Number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "300px", marginBottom: "20px" }}
        />
      </div>

      {error || filteredOrders.length === 0 ? (
        <div className="no-orders">
          <h3>No Orders Found</h3>
          <p>No orders match your search criteria.</p>
        </div>
      ) : (
        filteredOrders.map((order) => {
          const { orderNumber, cart = [], subtotal = 0, total = 0, date, taxes = 0, status } = order;
          return (
            <div key={orderNumber} className="order-summary">
              <h3>Order Number: {orderNumber}</h3>
              <p>Order Date: {formatDate(date)}</p>
              <p>Delivery Status: <strong>{status}</strong></p>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <h3>Order Summary</h3>
                </AccordionSummary>
                <AccordionDetails>
                  <div className="order-details">
                    {cart.map((item, index) => (
                      <div className="order-item" key={index}>
                        <h4>{item.name}</h4>
                        <p>{item.quantity} x ₹{item.price} = ₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                    <div className="order-summary-right">
                      <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
                      <p>Taxes: ₹{taxes.toFixed(2)}</p>
                      <h3>Total: ₹{total.toFixed(2)}</h3>
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                <Button onClick={() => handleEdit(order)}>Edit Order</Button>
                <Popconfirm title="Delete this order?" onConfirm={() => handleDeleteOrder(order._id)} okText="Yes" cancelText="No">
                  <Button danger>Delete</Button>
                </Popconfirm>
              </div>
            </div>
          );
        })
      )}

      <Modal open={editingOrder !== null} onCancel={() => { setEditingOrder(null); form.resetFields(); }} footer={null}>
        <Form form={form} onFinish={handleSave}>
          <Form.Item label="Order Number" name="orderNumber">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Delivery Status" name="status">
            <Select>
              {statusOptions.map(option => <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>)}
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit">Save Changes</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderManagement;
