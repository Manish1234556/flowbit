const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  customerId: String,
  status: { type: String, default: "open" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Ticket", ticketSchema);
