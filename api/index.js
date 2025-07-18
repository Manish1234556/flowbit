require("dotenv").config();
const express = require("express");

console.log("✅ index.js running");

const app = express();

const ticketRoutes = require("./routes/tickets");
const authRoutes = require("./routes/auth");
const meRoutes = require("./routes/me");
const authMiddleware = require("./middleware/authMiddleware");
const db = require("./db");

const PORT = process.env.PORT || 4000;

app.use((req, res, next) => {
  res.on("finish", () => {});
  next();
});

app.use(express.json());

console.log("✅ Mounting /api/tickets");
app.use("/api/tickets", ticketRoutes);

console.log("✅ Mounting /api/auth");
app.use("/api/auth", authRoutes);

console.log("✅ Mounting /api/me");
app.use("/api/me", meRoutes);

app.post("/webhook/ticket-done", async (req, res) => {
  if (req.body.secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ success: false, msg: "Unauthorized" });
  }

  console.log("✅ Ticket Done hit:", req.body);

  const Ticket = require("./models/Ticket");

  try {
    console.log("✅ Querying for ticketId:", req.body.ticketId);
    const ticket = await Ticket.findOneAndUpdate(
      { ticketId: req.body.ticketId },
      { status: "done", updatedAt: new Date() },
      { new: true }
    );

    if (!ticket) {
      console.log("❌ No ticket found for ticketId:", req.body.ticketId);
      return res.status(404).json({ success: false, msg: "Ticket not found" });
    }

    res.json({ success: true, msg: "Ticket marked done", ticket });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ success: false, msg: "Error marking ticket done" });
  }
});

app.get("/api/admin/test", authMiddleware(["Admin"]), (req, res) => {
  res.json({ success: true, msg: `Hello Admin ${req.user.userId}` });
});

app.all("*", (req, res) => {
  res.status(404).json({ success: false, msg: `Route ${req.url} not found` });
});

if (process.env.NODE_ENV !== "test") {
  (async () => {
    try {
      await db.connect();
      console.log("✅ MongoDB connected");

      app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
      });
    } catch (err) {
      console.error("❌ Startup failed:", err);
      process.exit(1);
    }
  })();
}

module.exports = app;
