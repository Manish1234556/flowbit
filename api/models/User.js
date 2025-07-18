const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  customerId: String,
  role: { type: String, enum: ["Admin", "User"] },
});

module.exports = mongoose.model("User", userSchema);
