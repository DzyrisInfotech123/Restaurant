import React, { useState, useEffect } from "react";
import { message, Button, Modal, Form, Input, Popconfirm, Select } from "antd";
import axios from "./Services/Api";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import moment from "moment";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null); // Store restaurantId from API response

  // Order status options
  const statusOptions = [
    { value: "booked", label: "Booked" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "packed", label: "Packed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search query
  useEffect(() => {
    const filtered = orders.filter(
      (order) =>
        order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (!order.priceType || order.priceType === "purchase")
    );
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  // Fetch orders and extract restaurantId
  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`/getAllOrders`);
  
      if (data.length > 0) {
        setRestaurantId(data[0]?.restaurantId); // Ensure we store the first restaurantId
      }
  
      setOrders(data);
      setFilteredOrders(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders.");
      setLoading(false);
    }
  };
  

  // Open edit modal with order details
  const handleEdit = (order) => {
    setEditingOrder(order);
    form.setFieldsValue({
      orderNumber: order.orderNumber,
      status: order.status || "booked",
    });
  };

  // Delete an order
  const handleDeleteOrder = async (id) => {
    try {
      await axios.delete(`/deleteOrder/${id}`);
      message.success("Order deleted successfully");
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== id));
      setFilteredOrders((prevOrders) => prevOrders.filter((order) => order._id !== id));
    } catch (error) {
      console.error("Error deleting order:", error);
      message.error("Failed to delete order.");
    }
  };

  // Save order updates
  const handleSave = async (values) => {
    try {
      const existingOrder = orders.find(order => order.orderNumber === values.orderNumber);
      if (!existingOrder) {
        message.error("Order not found.");
        return;
      }
  
      const updatedCart = existingOrder.cart.map((item) => ({
        ...item,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity,
      }));
  
      const payload = {
        cart: updatedCart,
        subtotal: updatedCart.reduce((acc, item) => acc + item.totalPrice, 0),
        taxes: updatedCart.reduce((acc, item) => acc + item.totalPrice, 0) * 0.12,
        total: updatedCart.reduce((acc, item) => acc + item.totalPrice, 0) * 1.12,
        date: new Date().toISOString(),
        status: values.status,
      };
  
      const { data } = await axios.put(`/updateOrder/${values.orderNumber}`, payload);
      message.success("Order updated successfully");
  
      setOrders((prevOrders) => prevOrders.map(order =>
        order.orderNumber === values.orderNumber ? { ...order, ...data } : order
      ));
      setFilteredOrders((prevOrders) => prevOrders.map(order =>
        order.orderNumber === values.orderNumber ? { ...order, ...data } : order
      ));
  
      // 🛠 Extract `restaurantId` from the first cart item instead
      const restaurantId = existingOrder.cart.length > 0 ? existingOrder.cart[0].restaurantId : null;
  
      if (values.status === "confirmed") {
        if (!restaurantId) {
          message.error("❌ Restaurant ID is missing. Unable to update stock.");
          return;
        }
  
        const stockUpdates = updatedCart.map((item) => ({
          itemId: item._id, // Ensure this matches your inventory schema
          inStock: -Math.abs(item.quantity),
        }));
  
        console.log("📦 Sending stock update request:", { restaurantId, stockUpdates });
  
        await axios.put(`/updateStock`, { restaurantId, stockUpdates });
        message.success("Stock deducted from inventory");
      }
  
      setEditingOrder(null);
      form.resetFields();
    } catch (error) {
      console.error("❌ Error updating order:", error);
      message.error(error.response?.data?.message || "Failed to update order.");
    }
  };
    const formatDate = (date) => {
    const parsedDate = moment(date);
    return parsedDate.isValid() ? parsedDate.format("MMMM DD, YYYY") : "Invalid Date";
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
          <Form.Item label="Order Number" name="orderNumber"><Input disabled /></Form.Item>
          <Form.Item label="Delivery Status" name="status">
            <Select onChange={() => form.submit()}>
              {statusOptions.map(option => <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderManagement;
