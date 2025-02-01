import React, { useState, useEffect } from "react";
import { message, Button, Modal, Form, Input, Popconfirm, InputNumber, Select } from "antd"; // Import Select
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

const trackingSteps = [
  { label: "Booked", icon: "fas fa-cart-plus", date: "Jan 01, 2025" },
  { label: "Confirmed", icon: "fas fa-check-circle", date: "Jan 02, 2025" },
  { label: "Processing", icon: "fas fa-concierge-bell", date: "Jan 03, 2025" },
  { label: "Packed", icon: "fas fa-box", date: "Jan 04, 2025" },
  { label: "Shipped", icon: "fas fa-truck", date: "Jan 05, 2025" },
  { label: "Delivered", icon: "fas fa-clipboard-check", date: "Jan 12, 2025" },
  { label: "Cancelled", icon: "fas fa-times-circle", date: "Jan 13, 2025" }, // Added Cancelled step
];

const OrderManagement = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.cart.some((item) =>
          item.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/getOrder");
      setOrders(data);
      setFilteredOrders(data);
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

  // Generate PDF invoice
  const generateInvoice = (order) => {
    // ... (existing code for generating PDF)
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="search-bar">
        <Input
          placeholder="Search by Order Number or Vendor Name"
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
          const { orderNumber, cart = [], currentStep = 0, subtotal = 0, total = 0, orderDate, taxes = 0, status } = order;
          const formattedOrderDate = formatDate(orderDate); // Format the order date

          return (
            <div key={orderNumber} className="order-summary">
              <h3>
                Order Number: {orderNumber}{" "}
                {cart && cart[0] && cart[0].vendorName ? `- Vendor: ${cart[0].vendorName}` : ""}
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
                                < p className="calculation">
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

                {/* Tracking Progress inside the Accordion */}
                <AccordionDetails>
                  <h3 className="trackhead">Track Your Order</h3>
                  <Stepper activeStep={currentStep} alternativeLabel>
                    {trackingSteps.map((step, index) => (
                      <Step key={index}>
                        <StepLabel
                          StepIconComponent={() => (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                color: index <= currentStep ? "#388e3c" : "#cccccc",
                              }}
                            >
                              <i
                                className={step.icon}
                                style={{
                                  fontSize: "24px",
                                  color: index <= currentStep ? "#388e3c" : "#cccccc",
                                }}
                              />
                              <span style={{ fontSize: "12px", marginTop: "4px" }}>
                                {step.date}
                              </span>
                            </div>
                          )}
                        >
                          {step.label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
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
                {/* <Button onClick={() => generateInvoice(order)}>Download Invoice</Button> */}
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
            <Select>
              <Select.Option value="booked">Booked</Select.Option>
              <Select.Option value="confirmed">Confirmed</Select.Option>
              <Select.Option value="processing">Processing</Select.Option>
              <Select.Option value="packed">Packed</Select.Option>
              <Select.Option value="shipped">Shipped</Select.Option>
              <Select.Option value="delivered">Delivered</Select.Option>
              <Select.Option value="cancelled">Cancelled</Select.Option>
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
                  <InputNumber min={1} />
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