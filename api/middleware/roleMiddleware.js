export function verifyAdmin(req, res, next) {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ msg: "Admin only route" });
  }
  next();
}
