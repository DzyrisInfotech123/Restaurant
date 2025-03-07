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

  // Function to determine which statuses should be disabled
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
      const { data } = await axios.get("/getOrder");
      
      // Retrieve vendorId from local storage
      const vendorId = localStorage.getItem("vendorId");

      // Filter orders based on vendorId and priceType
      const filteredOrders = data.filter(order => 
        order.cart.some(item => item.vendorId === vendorId) && order.priceType === "sale"
      );

      setOrders(filteredOrders);
      setFilteredOrders(filteredOrders);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch orders.");
      setLoading(false);
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    form.setFieldsValue({
      orderNumber: order.orderNumber,
      cart: order.cart || [],
      status: order.status || "booked", // Set the current status
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
          quantity: item.quantity, // Update only the quantity
          totalPrice: existingItem.price * item.quantity, // Recalculate totalPrice
        };
      });

      const payload = {
        cart: updatedCart,
        subtotal: updatedCart.reduce((acc, item) => acc + item.totalPrice, 0),
        taxes: updatedCart.reduce((acc, item) => acc + item.totalPrice, 0) * 0.12, // Assuming a tax rate of 12%
        total: updatedCart.reduce((acc, item) => acc + item.totalPrice, 0) * 1.12, // Total including taxes
        date: new Date().toISOString(),
        status: values.status, // Include the status in the payload
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
    const parsedDate = moment(date); // Parsing ISO string
    if (!parsedDate.isValid()) {
      return "Invalid Date";
    }
    return parsedDate.format('MMMM DD, YYYY'); // Format like "January 18, 2025"
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
          const formattedOrderDate = formatDate(date); // Format the order date

          return (
            <div key={orderNumber} className="order-summary">
              <h3>
                Order Number: {orderNumber}
              </h3>
              <p>Order Date: {formattedOrderDate}</p>

              {/* Delivery Status Display */}
              <p>
                Delivery Status: <strong>{status}</strong>
              </p>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <h3>Order Summary</h3>
                </AccordionSummary>
                <AccordionDetails>
                  <div className="order-details">
                    <div className="order-items">
                      {cart.length > 0 ? (
                        cart.map((item, index) => {
                          const addOnTotal = Array.isArray(item.addOns)
                            ? item.addOns.reduce(
                                (sum, addOn) => sum + parseFloat(addOn.price || 0),
                                0
                              )
                            : 0;
                          const itemPrice = parseFloat(item.price || 0);
                          const itemTotal =
                            (itemPrice + addOnTotal) * (item.quantity || 1);

                          return (
                            <div className="order-item" key={index}>
                              <div className="order-item-info">
                                <h4>{item.name}</h4>
                                <p className="calculation">
                                  {item.quantity} x ₹{itemPrice}{" "}
                                  {Array.isArray(item.addOns) && item.addOns.length > 0
                                    ? `+ ${item.addOns
                                        .map((addOn) => `${addOn.name} (₹${addOn.price})`)
                                        .join(" + ")}` 
                                    : ""}{" "}
                                  = ₹{itemTotal.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p>No items found in this order.</p>
                      )}
                    </div>

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
                <Popconfirm
                  title="Are you sure you want to delete this order?"
                  onConfirm={() => handleDeleteOrder(order._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger>Delete</Button>
                </Popconfirm>
              </div>
            </div>
          );
        })
      )}

      <Modal
        open={editingOrder !== null}
        title={`Edit Quantity - ${editingOrder?.orderNumber}`}
        onCancel={() => { setEditingOrder(null); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} onFinish={handleSave}>
          <Form.Item label="Order Number" name="orderNumber">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Delivery Status" name="status">
            <Select
              onChange={(value) => form.setFieldsValue({ status: value })} // Update form value on change
            >
              {statusOptions.map(option => (
                <Select.Option 
                  key={option.value} 
                  value={option.value} 
                  disabled={getDisabledStatuses(form.getFieldValue("status")).includes(option.value)}
                >
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div>
            <h4>Cart Items</h4>
            {form.getFieldValue("cart")?.map((item, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <Form.Item
                  label={`${item.name} in kg`}
                  name={["cart", index, "quantity"]}
                  initialValue={item.quantity}
                  rules={[{ required: true, message: "Quantity is required" }]}>
                  <InputNumber 
                    min={1} 
                    onKeyPress={(e) => {
                      // Allow only numbers
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }} 
                  />
                </Form.Item>
              </div>
            ))}
          </div>

          <Button type="primary" htmlType="submit">Save Changes</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderManagement;