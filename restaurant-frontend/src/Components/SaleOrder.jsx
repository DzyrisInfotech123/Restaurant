import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLocation } from "react-router-dom";
import "./SaleOrder.css"; // Create a separate CSS file for styling
import Header from "./Header";
import moment from "moment";

const SaleOrder = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceType, setPriceType] = useState(localStorage.getItem("priceType") || "purchase");

  // Fetch sales orders
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
        if (response.data && response.data.length === 0) {
          setOrders([]);
        } else {
          const updatedOrders = response.data
            .filter(order => order.priceType === "purchase") // Filter for priceType = "sale"
            .map((order) => {
              return {
                ...order,
                formattedOrderDate: moment(order.orderDate).format('MMMM DD, YYYY'),
              };
            });

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
        <button className="back" onClick={() => window.location.href = `/home?priceType=${priceType}`}>
          Back to Restaurants
        </button>
      </div>

      {error || orders.length === 0 ? (
        <div className="no-orders">
          <h3>You have no Purchase Orders</h3>
          <p>There are no purchase orders associated with your account at the moment.</p>
        </div>
      ) : (
        orders.map((order) => {
          const { cart = [], subtotal = 0, total = 0, orderNumber, formattedOrderDate } = order;

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
                          const itemPrice = parseFloat(item.price || 0);
                          const itemTotal = itemPrice * (item.quantity || 1);

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
                                  {item.quantity} x ₹{itemPrice} = ₹{itemTotal.toFixed(2)}
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
                      <h3>Total: ₹{total.toFixed(2)}</h3>
                    </div>
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