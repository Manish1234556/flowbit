// /middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

// Pass roles: [] for any logged-in user
// Pass roles: ["Admin"] for admin-only routes
const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Missing token" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (roles.length && !roles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ message: "Forbidden: Insufficient role" });
      }

      req.user = decoded; // { customerId, role, ... }
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};

module.exports = authMiddleware;
