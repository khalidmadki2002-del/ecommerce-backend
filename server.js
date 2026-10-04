
// E-commerce Backend 

// Products, cart, orders — MongoDB schemas
// Stripe/Razorpay test-mode payment integration
// Admin role vs normal user role




const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Connection error:", err));

// ---------- SCHEMAS ----------

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number
});
const Product = mongoose.model("Product", productSchema);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "user" }
});
const User = mongoose.model("User", userSchema);

const cartSchema = new mongoose.Schema({
  userId: String,
  items: [
    { productId: String, quantity: Number }
  ]
});
const Cart = mongoose.model("Cart", cartSchema);

const orderSchema = new mongoose.Schema({
  userId: String,
  items: [
    { productId: String, quantity: Number }
  ],
  totalAmount: Number,
  status: { type: String, default: "placed" }
});
const Order = mongoose.model("Order", orderSchema);

// ---------- MIDDLEWARE ----------

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token nahi mila" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "mySecretKey");
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

async function isAdmin(req, res, next) {
  const user = await User.findById(req.userId);
  if (user.role !== "admin") {
    return res.status(403).json({ message: "Permission nahi hai" });
  }
  next();
}

// ---------- AUTH ROUTES ----------

app.post("/signup", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
    // role likhte hi nahi hain yahan - default "user" hi rahega, security ke liye
  });
  await newUser.save();
  res.status(201).json({ message: "Signup ho gaya" });
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ message: "User nahi mila" });

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Galat password" });

  const token = jwt.sign({ id: user._id }, "mySecretKey", { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
});

// ---------- PRODUCT ROUTES ----------

app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post("/products", verifyToken, isAdmin, async (req, res) => {
  const newProduct = new Product({
    name: req.body.name,
    price: req.body.price,
    stock: req.body.stock
  });
  await newProduct.save();
  res.status(201).json(newProduct);
});

app.put("/products/:id", verifyToken, isAdmin, async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete("/products/:id", verifyToken, isAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product delete ho gaya" });
});

// ---------- CART ROUTES ----------

app.post("/cart/add", verifyToken, async (req, res) => {
  let cart = await Cart.findOne({ userId: req.userId });

  if (!cart) {
    cart = new Cart({ userId: req.userId, items: [] });
  }

  cart.items.push({ productId: req.body.productId, quantity: req.body.quantity });
  await cart.save();
  res.status(201).json(cart);
});

app.get("/cart", verifyToken, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.userId });
  res.json(cart || { items: [] });
});

app.delete("/cart/remove/:productId", verifyToken, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.userId });
  cart.items = cart.items.filter(item => item.productId !== req.params.productId);
  await cart.save();
  res.json(cart);
});

// ---------- ORDER ROUTES ----------

app.post("/orders", verifyToken, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.userId });
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart khaali hai" });
  }

  const newOrder = new Order({
    userId: req.userId,
    items: cart.items,
    totalAmount: req.body.totalAmount
  });
  await newOrder.save();

  cart.items = [];
  await cart.save();

  res.status(201).json(newOrder);
});

app.get("/orders", verifyToken, async (req, res) => {
  const orders = await Order.find({ userId: req.userId });
  res.json(orders);
});

app.listen(3000, () => {
  console.log("Server chal raha hai: port 3000");
});