const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ 'origin': '*' }));
app.use(express.json());

// MongoDB Connection
console.log(process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Order Schema and Model
const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customer: { type: String, required: true },
  products: { type: [String], required: true },
  total: { type: Number, required: true },
  status: { type: String, required: true }, // e.g., 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'
  contact: {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  paymentStatus: { type: String, required: true },
  orderDate: { type: String, required: true },
  razorpayPaymentId: { type: String },
  razorpayOrderId: { type: String },
  razorpaySignature: { type: String },
}, { timestamps: true }); // Add timestamps for created and updated dates

const Order = mongoose.model('Order', orderSchema);

// API Routes
app.get('/', (req, res) => {
  res.send('Xefag Backend API is running!');
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // Sort by newest first
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get order by ID (for user tracking)
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create a new order
app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { status: status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Dummy data for initial population (remove in production)
app.post('/api/orders/seed', async (req, res) => {
  try {
    await Order.deleteMany({}); // Clear existing data
    const dummyOrders = [
      { id: 'XEF123456', customer: 'John Doe', products: ['VELAR x 2'], total: 410, status: 'Processing', contact: { email: 'john.doe@example.com', phone: '123-456-7890', address: '123 Main St, Anytown, USA' }, paymentStatus: 'Pending', orderDate: '2023-10-26' },
      { id: 'XEF789012', customer: 'Jane Smith', products: ['Premium Combo x 1'], total: 799, status: 'Delivered', contact: { email: 'jane.smith@example.com', phone: '098-765-4321', address: '456 Oak Ave, Anytown, USA' }, paymentStatus: 'Paid', orderDate: '2023-10-20' },
    ];
    await Order.insertMany(dummyOrders);
    res.status(201).json({ message: 'Dummy orders seeded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 