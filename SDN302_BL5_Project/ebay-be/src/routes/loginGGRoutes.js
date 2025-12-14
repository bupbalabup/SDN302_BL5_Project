import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";

const router = express.Router();

// 1️⃣ Bắt đầu login Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 2️⃣ Callback sau khi Google xác thực
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login/failed" }),
  async (req, res) => {
    // Tạo JWT token
    const user = req.user;
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "1d" }
    );

    // Có thể gửi token về frontend qua redirect URL
    res.redirect(`http://localhost:3000/login/google?token=${token}`);
  }
);

router.get("/login/failed", (req, res) =>
  res.status(401).json({ message: "Google login failed" })
);

export default router;
