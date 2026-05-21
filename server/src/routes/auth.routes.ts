import { Router, Request, Response } from "express";
import { db } from "../db";
import { verifyToken } from "../middleware/auth.middleware";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { otpStore } from "../utils/otpStore";
import { sendOTPEmail } from "../utils/mailer";

const router = Router();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 🔐 LOGIN
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isAdmin = user.role === "admin";

    if (isAdmin) {
      const tempToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "5m" }
      );

      const code = generateOTP();

      otpStore.set(user.id, {
        code,
        expiresAt: Date.now() + 2 * 60 * 1000,
      });

      await sendOTPEmail(user.email, code);

      return res.json({
        message: "2FA code sent to email",
        requires2FA: true,
        tempToken,
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// 👤 ME
router.get("/me", verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const result = await db.query(
      "SELECT id, full_name, email, role FROM users WHERE id = $1",
      [userId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (err: any) {
    console.error("GET ME ERROR:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// OTP VERIFY
router.post("/verify-2fa", async (req: Request, res: Response) => {
  const { code } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid or missing token" });
  }

  const tempToken = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET!) as any;

    const stored = otpStore.get(decoded.id);

    if (!stored) {
      return res.status(400).json({ message: "No OTP found" });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(decoded.id);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (stored.code !== code) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    otpStore.delete(decoded.id);

    const token = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    const result = await db.query(
      "SELECT id, full_name, email, role FROM users WHERE id = $1",
      [decoded.id]
    );

    return res.json({
      message: "2FA verified",
      token,
      user: result.rows[0],
    });
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
});

// RESEND OTP
router.post("/resend-otp", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid token" });
  }

  const tempToken = authHeader.split(" ")[1];
  const decoded = jwt.verify(tempToken, process.env.JWT_SECRET!) as any;

  const user = await db.query("SELECT email FROM users WHERE id=$1", [
    decoded.id,
  ]);

  const code = generateOTP();

  otpStore.set(decoded.id, {
    code,
    expiresAt: Date.now() + 2 * 60 * 1000,
  });

  await sendOTPEmail(user.rows[0].email, code);

  return res.json({ message: "OTP resent" });
});

// REGISTER
router.post("/register", async (req: Request, res: Response) => {
  const { full_name, email, password, role } = req.body;

  try {
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existing = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `
      INSERT INTO users (full_name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, email, role
      `,
      [full_name, email, hashedPassword, role]
    );

    return res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

export default router;
