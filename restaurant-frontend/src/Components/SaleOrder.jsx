import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLocation } from "react-router-dom";
import moment from "moment";
import "./SaleOrder.css"; 
import Header from "./Header";

const trackingSteps = [
  { label: "Booked", status: "booked", icon: "fas fa-cart-plus" },
  { label: "Confirmed", status: "confirmed", icon: "fas fa-check-circle" },
  { label: "Processing", status: "processing", icon: "fas fa-concierge-bell" },
  { label: "Packed", status: "packed", icon: "fas fa-box" },
  { label: "Shipped", status: "shipped", icon: "fas fa-truck" },
  { label: "Delivered", status: "delivered", icon: "fas fa-clipboard-check" },
];

// Function to find step index from status
const getCurrentStep = (status) => {
  const index = trackingSteps.findIndex((step) => step.status === status);
  return index !== -1 ? index : 0;
};

const SaleOrder = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceType] = useState(localStorage.getItem("priceType") || "purchase");

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
          `https://dev.digitalexamregistration.com/api/getOrder?vendorId=${vendorId}`
        );

        console.log("API Response:", response.data); 

        if (!response.data || response.data.length === 0) {
          setOrders([]);
        } else {
          const updatedOrders = response.data
            .filter((order) => order.priceType === "purchase")
            .map((order) => ({
              ...order,
              formattedOrderDate: moment(order.date).format("MMMM DD, YYYY"),
              currentStep: getCurrentStep(order.status),
            }));

          setOrders(updatedOrders);
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="sale-order">
      <Header />
      <h2>Purchase Order Status</h2>
      <div className="button-container">
        <button
          className="back"
          onClick={() => (window.location.href = `/home?priceType=${priceType}`)}
        >
          Back to Restaurants
        </button>
      </div>

      {error || orders.length === 0 ? (
        <div className="no-orders">
          <h3>You have no Purchase Orders</h3>
          <p>No purchase orders associated with your account.</p>
        </div>
      ) : (
        orders.map((order) => {
          const {
            cart = [],
            subtotal = 0,
            total = 0,
            orderNumber,
            formattedOrderDate,
            currentStep = 0,
            status,
          } = order;

          console.log(`Order ${orderNumber} - Current Step:`, currentStep); 

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
                        cart.map((item, index) => (
                          <div className="order-item" key={index}>
                            <div className="order-item-info">
                              <img
                                src={
                                  item.imgPath
                                    ? `https://dev.digitalexamregistration.com/api/${item.imgPath}`
                                    : "/path/to/default-image.jpg"
                                }
                                alt={item.name}
                                className="item-image"
                                onError={(e) => {
                                  e.target.src = "/path/to/default-image.jpg";
                                }}
                              />
                              <h4>{item.name}</h4>
                              <p className="calculation">
                                {item.quantity} x ₹{parseFloat(item.price || 0)} = ₹
                                {(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No items found in your order.</p>
                      )}
                    </div>

                    <div className="order-summary-right">
                      <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
                      <h3>Total: ₹{total.toFixed(2)}</h3>
                    </div>
                  </div>
                </AccordionDetails>

                {/* Order Tracking Stepper */}
                <AccordionDetails>
                  <div className="order-tracking">
                    <h3 className="trackhead">Track Your Order</h3>
                    <Stepper activeStep={currentStep} alternativeLabel>
                      {trackingSteps.map((step, index) => (
                        <Step key={index} completed={index <= currentStep}>
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
                                  {index <= currentStep ? "Done" : "Pending"}
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

export default SaleOrder;
