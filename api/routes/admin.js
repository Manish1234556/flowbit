const express = require("express");
const router = express.Router();

// Example secured admin-only route
router.get("/secret", (req, res) => {
  res.json({
    message: `Hello Admin ${req.user.email}, this is your secret admin data!`,
  });
});

module.exports = router;
