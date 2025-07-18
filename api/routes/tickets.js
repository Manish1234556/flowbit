const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const axios = require("axios");
const authMiddleware = require("../middleware/authMiddleware");

// =============================
// POST /api/tickets
// =============================
router.post("/", authMiddleware(), async (req, res) => {
  try {
    const newTicket = await Ticket.create({
      ticketId: req.body.ticketId || "abc123",
      customerId: req.user.customerId, // ✅ secure: tenant-aware
    });

    console.log("✅ Ticket saved:", newTicket);

    // Call n8n webhook
    const webhookURL = "http://localhost:5678/webhook/test";
    const response = await axios.post(webhookURL, {
      ticketId: newTicket.ticketId,
      customerId: newTicket.customerId,
    });

    console.log("✅ n8n responded:", response.data);

    res.json({ success: true, msg: "Ticket created & n8n called" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Could not create ticket" });
  }
});

// =============================
// GET /api/tickets
// =============================
router.get("/", authMiddleware(), async (req, res) => {
  try {
    const tickets = await Ticket.find({ customerId: req.user.customerId });
    res.json({ success: true, tickets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Could not fetch tickets" });
  }
});

// =============================
// GET by ticketId
// =============================
router.get("/:ticketId", authMiddleware(), async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      ticketId: req.params.ticketId,
      customerId: req.user.customerId,
    });
    if (!ticket) {
      return res.status(404).json({ success: false, msg: "Ticket not found" });
    }
    res.json({ success: true, ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Could not fetch ticket" });
  }
});

// =============================
// GET by Mongo _id
// =============================
router.get("/id/:id", authMiddleware(), async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      customerId: req.user.customerId,
    });
    if (!ticket) {
      return res.status(404).json({ success: false, msg: "Ticket not found" });
    }
    res.json({ success: true, ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Could not fetch ticket" });
  }
});

// =============================
// DELETE by ticketId - Admin only
// =============================
router.delete("/:ticketId", authMiddleware(["Admin"]), async (req, res) => {
  try {
    const deleted = await Ticket.findOneAndDelete({
      ticketId: req.params.ticketId,
      customerId: req.user.customerId,
    });
    if (!deleted) {
      return res.status(404).json({ success: false, msg: "Ticket not found" });
    }
    res.json({ success: true, msg: "Ticket deleted", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Could not delete ticket" });
  }
});

// =============================
// DELETE by Mongo _id - Admin only
// =============================
router.delete("/id/:id", authMiddleware(["Admin"]), async (req, res) => {
  try {
    const deleted = await Ticket.findOneAndDelete({
      _id: req.params.id,
      customerId: req.user.customerId,
    });
    if (!deleted) {
      return res.status(404).json({ success: false, msg: "Ticket not found" });
    }
    res.json({ success: true, msg: "Ticket deleted", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Could not delete ticket" });
  }
});

module.exports = router;
