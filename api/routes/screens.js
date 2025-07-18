const express = require("express");
const router = express.Router();

// Example /me/screens route
router.get("/", (req, res) => {
  const screens = [
    { tenant: "LogisticsCo", screenUrl: "/support-tickets" },
    { tenant: "RetailGmbH", screenUrl: "/orders" },
  ];
  res.json({ screens });
});

module.exports = router;
