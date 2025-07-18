const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  const { email, password, customerId, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      customerId,
      role,
    });

    const token = jwt.sign(
      { userId: user._id, customerId: user.customerId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      msg: "User registered successfully",
      token,
      user: {
        _id: user._id,
        email: user.email,
        customerId: user.customerId,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Error registering user" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, customerId: user.customerId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      msg: "Login successful",
      token,
      user: {
        _id: user._id,
        email: user.email,
        customerId: user.customerId,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Error logging in" });
  }
});

module.exports = router;
