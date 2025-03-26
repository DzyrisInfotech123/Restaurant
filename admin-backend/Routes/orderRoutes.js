const express = require("express");
const crypto = require("crypto");
const Order = require("../Models/Order");

const router = express.Router();

// Place an order
router.post("/placeOrder", async (req, res) => {
  try {
    const { cart, subtotal, taxes, total, date, priceType} = req.body;

    // Validate required fields
    if (!cart || !subtotal || !taxes || !total || !date || !priceType) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    for (const item of cart) {
      if (!item.vendorId || !item.imgPath) {
        return res.status(400).json({ error: "Cart items must include vendorId and imgPath." });
      }
    }

    // Generate a unique order number
    const orderNumber = crypto.randomBytes(6).toString("hex").toUpperCase();

    // Create the new order
    const newOrder = new Order({
      orderNumber,
      cart,
      subtotal,
      taxes,
      total,
      date: new Date(date),
      priceType,
    });
    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Failed to place order", details: error.message });
  }
});

// Fetch all orders where type = "purchase"
router.get("/getAllOrders", async (req, res) => {
  try {
    const orders = await Order.find({ type: "purchase" }).lean(); // Convert to plain objects

    if (!orders.length) {
      return res.status(404).json({ error: "No purchase orders found." });
    }

    // Make sure each order includes `restaurantId`
    res.status(200).json(orders.map(order => ({
      ...order,
      restaurantId: order.restaurantId || null, // Ensure it's always present
    })));
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders", details: error.message });
  }
});


// Fetch orders for a specific vendor
router.get("/getOrders", async (req, res) => {
  const { vendorId } = req.query;

  if (!vendorId) {
    return res.status(400).json({ error: "Vendor ID is required." });
  }

  try {
    console.log(`Fetching orders for vendor: ${vendorId}`);

    // Fetch orders for the vendor
    const orders = await Order.find({ "cart.vendorId": vendorId });

    if (!orders.length) {
      return res.status(404).json({ error: "No orders found for this vendor." });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders", details: error.message });
  }
});

// Fetch all orders for a specific vendor
router.get("/getOrder", async (req, res) => {
  try {
    const { vendorId } = req.query;

    if (!vendorId) {
      return res.status(400).json({ error: "Vendor ID is required." });
    }

    const orders = await Order.find({ "cart.vendorId": vendorId }).lean();

    if (!orders.length) {
      return res.status(404).json({ error: "No orders found for this vendor." });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders", details: error.message });
  }
});

// Search orders by order number
router.get("/searchOrders", async (req, res) => {
  const { orderNumber } = req.query;

  if (!orderNumber) {
    return res.status(400).json({ error: "Order number is required." });
  }

  try {
    const orders = await Order.find({ orderNumber: { $regex: orderNumber, $options: "i" } });

    if (!orders.length) {
      return res.status(404).json({ error: "No orders found with the given order number." });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error searching orders:", error);
    res.status(500).json({ error: "Failed to search orders", details: error.message });
  }
});

// Edit an existing order by order number
router.put("/updateOrder/:orderNumber", async (req, res) => {
  const { orderNumber } = req.params; // Extract orderNumber from the URL
  const updatedOrderData = req.body;

  console.log("Received request to update order:", orderNumber);
  console.log("Request body:", updatedOrderData);

  try {
    // Find the order by orderNumber
    const order = await Order.findOne({ orderNumber });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the entire order, including the cart and other fields
    order.cart = updatedOrderData.cart; // Update the cart with the new items
    order.subtotal = updatedOrderData.subtotal || order.subtotal; // Update the subtotal if provided
    order.taxes = updatedOrderData.taxes || order.taxes; // Update the taxes if provided
    order.total = updatedOrderData.total || order.total; // Update the total if provided
    order.date = updatedOrderData.date || order.date; // Update the date if provided
    order.status = updatedOrderData.status || order.status; // Update the status if provided

    // Save the updated order to the database
    const updatedOrder = await order.save();

    // Return the updated order
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update order", details: error.message });
  }
});

module.exports = router;
