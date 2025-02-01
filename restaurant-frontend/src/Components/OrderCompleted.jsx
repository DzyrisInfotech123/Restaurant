import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import moment from "moment";
import "./OrderConfirmation.css"; // Reuse the same styles
import Header from "./Header";

const OrderCompleted = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Use useNavigate for navigation
  const { deliveredOrders } = location.state || { deliveredOrders: [] }; // Get delivered orders from state

  const trackingSteps = [
    { label: "Booked", icon: "fas fa-cart-plus" },
    { label: "Confirmed", icon: "fas fa-check-circle" },
    { label: "Processing", icon: "fas fa-concierge-bell" },
    { label: "Packed", icon: "fas fa-box" },
    { label: "Shipped", icon: "fas fa-truck" },
    { label: "Delivered", icon: "fas fa-clipboard-check" },
  ];

  const formatDate = (date) => {
    const parsedDate = moment(date);
    if (!parsedDate.isValid()) {
      return "Invalid Date";
    }
    return parsedDate.format('MMMM DD, YYYY');
  };

  return (
    <div className="order-confirmation">
      <Header />
      <h2>Completed Orders</h2>
       {/* Back to Restaurants Button */}
       <button className="back" onClick={() => navigate("/home")}>
        Back to Restaurants
      </button>

      {deliveredOrders.length === 0 ? (
        <div className="no-orders">
          <h3>No completed orders found.</h3>
        </div>
      ) : (
        deliveredOrders.map((order) => {
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
                                  {stepDates[index] || "N/A"}
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

export default OrderCompleted;