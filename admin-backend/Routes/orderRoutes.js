const express = require("express");
const Order = require("../Models/Order");

const router = express.Router();

// Place an order
router.post("/placeOrder", async (req, res) => {
  try {
    const { orderNumber, cart, subtotal, taxes, total, date } = req.body;

    // Validate if all required fields are present
    if (!orderNumber || !cart || !subtotal || !taxes || !total || !date) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Create a new order document
    const newOrder = new Order({
      orderNumber,
      cart,
      subtotal,
      taxes,
      total,
      date: new Date(date), // Parse the date sent from the frontend
    });

    // Save the order to the database
    await newOrder.save();

    // Return the order confirmation response
    res.status(201).json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// Fetch an order by ID
router.get('/getOrder', async (req, res) => {
    const { id } = req.query;
  
    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
  
    try {
      // Check if ID is a valid ObjectId
      const isObjectId = /^[a-fA-F0-9]{24}$/.test(id);
  
      // Query by _id or orderNumber
      const order = isObjectId
        ? await Order.findById(id) // Query by MongoDB ObjectId
        : await Order.findOne({ orderNumber: id }); // Query by custom orderNumber
  
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      res.json({
        _id: order._id,
        orderNumber: order.orderNumber,
        cart: order.cart,
        subtotal: order.subtotal,
        taxes: order.taxes,
        total: order.total,
        date: order.date,
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  });
  

module.exports = router;
