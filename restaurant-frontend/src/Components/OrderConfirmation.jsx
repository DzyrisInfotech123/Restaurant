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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          // No orders found
          setOrders([]);  // Clear the orders state, indicating no orders.
        } else {
          // Set orders and update current step based on order status
          const updatedOrders = response.data.map((order) => {
            let currentStep = 0;
            let stepDates = []; // Array to hold the dates for each step

            // Determine the current step and populate stepDates
            if (order.status === "confirmed") {
              currentStep = 1;
              stepDates[0] = moment().format('MMMM DD, YYYY'); // Booked date
            } else if (order.status === "processing") {
              currentStep = 2;
              stepDates[0] = moment().subtract(1, 'days').format('MMMM DD, YYYY'); // Booked date
              stepDates[1] = moment().format('MMMM DD, YYYY'); // Confirmed date
            } else if (order.status === "packed") {
              currentStep = 3;
              stepDates[0] = moment().subtract(2, 'days').format('MMMM DD, YYYY'); // Booked date
              stepDates[1] = moment().subtract(1, 'days').format('MMMM DD, YYYY'); // Confirmed date
              stepDates[2] = moment().format('MMMM DD, YYYY'); // Processing date
            } else if (order.status === "shipped") {
              currentStep = 4;
              stepDates[0] = moment().subtract(3, 'days').format('MMMM DD, YYYY'); // Booked date
              stepDates[1] = moment().subtract(2, 'days').format('MMMM DD, YYYY'); // Confirmed date
              stepDates[2] = moment().subtract(1, 'days').format('MMMM DD, YYYY'); // Processing date
              stepDates[3] = moment().format('MMMM DD, YYYY'); // Packed date
            } else if (order.status === "delivered") {
              currentStep = 5;
              stepDates[0] = moment().subtract(4, 'days').format('MMMM DD, YYYY'); // Booked date
              stepDates[1] = moment().subtract(3, 'days').format('MMMM DD, YYYY'); // Confirmed date
              stepDates[2] = moment().subtract(2, 'days').format('MMMM DD, YYYY'); // Processing date
              stepDates[3] = moment().subtract(1, 'days').format('MMMM DD, YYYY'); // Packed date
              stepDates[4] = moment().format('MMMM DD, YYYY'); // Shipped date
            }

            return { ...order, currentStep, stepDates }; // Add currentStep and stepDates to the order object
          });
          setOrders(updatedOrders);  // Set fetched orders with currentStep and stepDates
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
    const parsedDate = moment(date); // Parsing ISO string
    if (!parsedDate.isValid()) {
      return "Invalid Date";
    }
    return parsedDate.format('MMMM DD, YYYY'); // Format like "January 18, 2025"
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="order-confirmation">
      <Header />
      <h2>Order Status</h2>
      <button className="back" onClick={() => (window.location.href = "/home")}>
        Back to Restaurants
      </button>

      {error || orders.length === 0 ? (
        <div className="no-orders">
          <h3>You have no orders</h3>
          <p>There are no orders associated with your account at the moment.</p>
        </div>
      ) : (
        orders.map((order) => {
          const { cart = [], subtotal = 0, total = 0, orderNumber, orderDate, taxes = 0, currentStep, stepDates } = order;

          const formattedOrderDate = formatDate(orderDate); // Format the order date

          return (
            <div key={orderNumber} className="order-summary">
              <h3>Order Number: {orderNumber}</h3>
              <p>Order Date: {formattedOrderDate}</p>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
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
                                  {stepDates[index] || "N/A"} {/* Display the date for the step */}
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