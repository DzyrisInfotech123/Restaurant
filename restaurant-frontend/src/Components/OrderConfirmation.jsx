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
  const [currentStep, setCurrentStep] = useState(0);

  const trackingSteps = [
    { label: "Booked", icon: "fas fa-cart-plus", date: "Jan 01, 2025" },
    { label: "Confirmed", icon: "fas fa-check-circle", date: "Jan 02, 2025" },
    { label: "Processing", icon: "fas fa-concierge-bell", date: "Jan 03, 2025" },
    { label: "Packed", icon: "fas fa-box", date: "Jan 04, 2025" },
    { label: "Shipped", icon: "fas fa-truck", date: "Jan 05, 2025" },
    { label: "Delivered", icon: "fas fa-clipboard-check", date: "Jan 12, 2025" },
  ];

  // Fetch orders
  useEffect(() => {
    const vendorId = localStorage.getItem("vendorId"); // Assuming vendorId is stored in localStorage

    const fetchOrders = async () => {
      if (!vendorId) {
        setError("Vendor ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:4001/api/getOrders?vendorId=${vendorId}`
        );
        if (response.data && response.data.length === 0) {
          // No orders found
          setOrders([]);  // Clear the orders state, indicating no orders.
        } else {
          setOrders(response.data);  // Set fetched orders
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

  // Simulate step progress
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < trackingSteps.length - 1 ? prev + 1 : prev));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (date) => {
    const parsedDate = moment(date);
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

      {/* Always show the header */}
      {error || orders.length === 0 ? (
        <div className="no-orders">
          <h3>You have no orders</h3>
          <p>There are no orders associated with your account at the moment.</p>
        </div>
      ) : (
        orders.map((order) => {
          const { cart = [], subtotal = 0, total = 0, orderNumber, orderDate, taxes = 0 } = order;

          // Use the formatDate function to ensure the date is formatted correctly
          const formattedOrderDate = formatDate(orderDate);

          return (
            <div key={orderNumber} className="order-summary">
              <h3>Order Number: {orderNumber}</h3> {/* Display Order Number */}
              <p>Order Date: {formattedOrderDate}</p> {/* Display Order Date */}

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
                                  src={item.imgPath ? `http://localhost:4001${item.imgPath}` : "/path/to/default-image.jpg"}
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

                {/* Add the tracking steps inside the Accordion */}
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
