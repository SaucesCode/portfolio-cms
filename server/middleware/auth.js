const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  // 1. Grab the token from the httpOnly cookie
  const token = req.cookies?.token;

  // 2. If there's no token, block the request immediately
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // 3. Verify the token is valid and hasn't expired
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to the request
    next(); // pass control to the next function (route handler)
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
