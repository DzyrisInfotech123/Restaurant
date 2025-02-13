import React, { useState, useEffect } from "react";
import axios from "axios";
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
import "./OrderConfirmation.css";
import Header from "./Header";
import moment from "moment";

const OrderConfirmation = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceType, setPriceType] = useState(localStorage.getItem("priceType") || "sale"); // Retrieve priceType from localStorage

  const trackingSteps = [
    { label: "Booked", icon: "fas fa-cart-plus" },
    { label: "Confirmed", icon: "fas fa-check-circle" },
    { label: "Processing", icon: "fas fa-concierge-bell" },
    { label: "Packed", icon: "fas fa-box" },
    { label: "Shipped", icon: "fas fa-truck" },
    { label: "Delivered", icon: "fas fa-clipboard-check" },
  ];

  // Fetch orders
  useEffect(() => {
    const vendorId = localStorage.getItem("vendorId");

    const fetchOrders = async () => {
      if (!vendorId) {
        setError("Vendor ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://dev.digitalexamregistration.com/api/getOrders?vendorId=${vendorId}`
        );
        if (response.data && response.data.length === 0) {
          setOrders([]);
        } else {
          const updatedOrders = response.data
            .filter(order => order.priceType === "purchase") // Filter for priceType = "purchase"
            .map((order) => {
              let currentStep = 0;
              let stepDates = [];

              // Set the date for the "Booked" step to the order date
              stepDates[0] = moment(order.orderDate).format('MMMM DD, YYYY');

              if (order.status === "confirmed") {
                currentStep = 1;
              } else if (order.status === "processing") {
                currentStep = 2;
              } else if (order.status === "packed") {
                currentStep = 3;
              } else if (order.status === "shipped") {
                currentStep = 4;
              } else if (order.status === "delivered") {
                currentStep = 5;
                stepDates[5] = moment(order.deliveryDate).format('MMMM DD, YYYY'); // Actual delivery date
              }

              // Fill in previous steps with "Done" if they are completed
              for (let i = 1; i <= currentStep; i++) {
                if (i < currentStep) {
                  stepDates[i] = "Done"; // Mark as done for completed steps
                }
              }

              // If the order is not delivered, set expected delivery date
              if (order.status !== "delivered") {
                const expectedDeliveryDate = moment(order.orderDate).add(5, 'days').format('MMMM DD, YYYY');
                stepDates[5] = `Expected delivery by ${expectedDeliveryDate}`;
              }

              return { ...order, currentStep, stepDates };
            });

          const activeOrders = updatedOrders.filter(order => order.status !== "delivered");
          const completedOrders = updatedOrders.filter(order => order.status === "delivered");

          setOrders(activeOrders);
          setDeliveredOrders(completedOrders);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (date) => {
    const parsedDate = moment(date);
    if (!parsedDate.isValid()) {
      return "Invalid Date";
    }
    return parsedDate.format('MMMM DD, YYYY');
  };

  const handleViewCompletedOrders = () => {
    window.location.href = "/order-completed"; // Use window.location.href instead of navigate
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="order-confirmation">
      <Header />
      <h2>Purchase Order Status</h2>
      <div className="button-container">
        <button className="back" onClick={() => window.location.href = `/home?priceType=${priceType}`}>
          Back to Restaurants
        </button>
        <button className="view-completed" onClick={handleViewCompletedOrders}>
          View Completed Orders
        </button>
      </div>

      {error || orders.length === 0 ? (
        <div className="no-orders">
          <h3>You have no Active Orders</h3>
          <p>There are no active orders associated with your account at the moment.</p>
        </div>
      ) : (
        orders.map((order) => {
          const { cart = [], subtotal = 0, total = 0, orderNumber, orderDate, taxes = 0, currentStep, stepDates } = order;

          const formattedOrderDate = formatDate(orderDate);

          return (
            <div key={orderNumber} className="order-summary">
              <h3>Order Number: {orderNumber}</h3>
              <p>Order Date: {formattedOrderDate}</p>

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
                                <img
                                  src={item.imgPath ? `https://dev.digitalexamregistration.com/api/${item.imgPath}` : "/path/to/default-image.jpg"}
                                  alt={item.name}
                                  className="item-image"
                                  onError={(e) => {
                                    e.target.src = "/path/to/default-image.jpg";
                                  }}
                                />
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
                        <p>No items found in your order.</p>
                      )}
                    </div>

                    <div className="order-summary-right">
                      <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
                      <p>Taxes: ₹{taxes.toFixed(2)}</p>
                      <h3>Total: ₹{total.toFixed(2)}</h3>
                    </div>
                  </div>
                </AccordionDetails>

                <AccordionDetails>
                  <div className="order-tracking">
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
                                  {stepDates[index] || "Pending"}
                                </span>
                              </div>
                            )}
                          >
                            {step.label}
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </div>
                </AccordionDetails>
              </Accordion>
            </div>
          );
        })
      )}
    </div>
  );
};

export default OrderConfirmation;