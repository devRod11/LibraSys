"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_middleware_1 = require("../middleware/auth.middleware");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const otpStore_1 = require("../utils/otpStore");
const mailer_1 = require("../utils/mailer");
const router = (0, express_1.Router)();
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
// 🔐 LOGIN (REAL DB VERSION)
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Missing credentials" });
        }
        // 🔎 find user in DB
        const result = await db_1.db.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }
        const isAdmin = user.role === "admin";
        if (isAdmin) {
            const tempToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "5m" });
            const code = generateOTP();
            // ⏱ expire in 2 minutes
            otpStore_1.otpStore.set(user.id, {
                code,
                expiresAt: Date.now() + 2 * 60 * 1000,
            });
            await (0, mailer_1.sendOTPEmail)(user.email, code);
            return res.json({
                message: "2FA code sent to email",
                requires2FA: true,
                tempToken,
            });
        }
        // 👇 student login (no 2FA)
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
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
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
});
router.get("/me", auth_middleware_1.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db_1.db.query("SELECT id, full_name, email, role FROM users WHERE id = $1", [userId]);
        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json(user);
    }
    catch (err) {
        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
});
router.post("/verify-2fa", async (req, res) => {
    const { code } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Invalid or missing token" });
    }
    const tempToken = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(tempToken, process.env.JWT_SECRET);
        const stored = otpStore_1.otpStore.get(decoded.id);
        if (!stored) {
            return res.status(400).json({ message: "No OTP found" });
        }
        if (Date.now() > stored.expiresAt) {
            otpStore_1.otpStore.delete(decoded.id);
            return res.status(400).json({ message: "OTP expired" });
        }
        if (stored.code !== code) {
            return res.status(401).json({ message: "Invalid OTP" });
        }
        otpStore_1.otpStore.delete(decoded.id);
        const token = jsonwebtoken_1.default.sign({ id: decoded.id, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        const result = await db_1.db.query("SELECT id, full_name, email, role FROM users WHERE id = $1", [decoded.id]);
        return res.json({
            message: "2FA verified",
            token,
            user: result.rows[0],
        });
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
});
router.post("/resend-otp", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Invalid token" });
    }
    const tempToken = authHeader.split(" ")[1];
    const decoded = jsonwebtoken_1.default.verify(tempToken, process.env.JWT_SECRET);
    const user = await db_1.db.query("SELECT email FROM users WHERE id=$1", [decoded.id]);
    const code = generateOTP();
    otpStore_1.otpStore.set(decoded.id, {
        code,
        expiresAt: Date.now() + 2 * 60 * 1000,
    });
    await (0, mailer_1.sendOTPEmail)(user.rows[0].email, code);
    res.json({ message: "OTP resent" });
});
// 📝 REGISTER (REAL DB VERSION)
router.post("/register", async (req, res) => {
    const { full_name, email, password, role } = req.body;
    try {
        if (!full_name || !email || !password || !role) {
            return res.status(400).json({ message: "Missing fields" });
        }
        // check if email exists
        const existing = await db_1.db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: "Email already exists" });
        }
        // insert user
        // 🔐 hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // insert user
        const result = await db_1.db.query(`
  INSERT INTO users (
    full_name,
    email,
    password,
    role
  )
  VALUES (
    $1,
    $2,
    $3,
    $4
  )
  RETURNING
    id,
    full_name,
    email,
    role
  `, [
            full_name,
            email,
            hashedPassword,
            role,
        ]);
        return res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
});
exports.default = router;
