const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const registry = require("../registry.json");

router.get("/screens", authMiddleware(["Admin", "User"]), (req, res) => {
  try {
    console.log("✅ /api/me/screens hit for customerId:", req.user.customerId);
    const customerId = req.user.customerId;
    const screens = registry.filter((entry) => entry.tenant === customerId);
    res.json(screens);
  } catch (err) {
    console.error("❌ Error in /api/me/screens:", err);
    res.status(500).json({ success: false, msg: "Error fetching screens" });
  }
});

module.exports = router;
