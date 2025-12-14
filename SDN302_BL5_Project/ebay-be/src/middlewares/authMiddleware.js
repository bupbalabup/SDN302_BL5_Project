import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  
  const secret = process.env.JWT_ACCESS_SECRET;
  
  console.log("🔐 Auth Check:", {
    path: req.path,
    method: req.method,
    authHeader: authHeader ? authHeader.substring(0, 30) + "..." : "NO AUTH HEADER",
    token: token ? token.substring(0, 20) + "..." : "NO TOKEN",
    secret: secret ? "SET (" + secret.length + " chars)" : "NOT SET"
  });
  
  if (!token) {
    console.error("❌ No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    console.log("✅ Token verified for user:", decoded.id);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token verification failed:");
    console.error("  Error:", error.message);
    console.error("  Error name:", error.name);
    
    // Debug: Decode tanpa verify để xem payload
    try {
      const decoded = jwt.decode(token);
      console.error("  Token payload:", decoded);
    } catch (e) {
      console.error("  Cannot decode token");
    }
    
    return res.status(403).json({ message: "Invalid token" });
  }
};
