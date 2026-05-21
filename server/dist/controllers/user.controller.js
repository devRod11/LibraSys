"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateMe = exports.getMe = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await db_1.db.query(`
      SELECT *
      FROM users
      WHERE id = $1
      `, [userId]);
        return res.json(user.rows[0]);
    }
    catch (err) {
        console.error("Get Profile Error:", err);
        return res.status(500).json({
            message: "Failed to fetch profile",
        });
    }
};
exports.getMe = getMe;
const updateMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = req.body;
        const updated = await db_1.db.query(`
      UPDATE users
      SET
        full_name = $1,
        email = $2,
        phone = $3,
        student_id = $4,
        course = $5,
        year_level = $6
      WHERE id = $7
      RETURNING *
      `, [
            data.full_name,
            data.email,
            data.phone,
            data.student_id,
            data.course,
            data.year_level,
            userId,
        ]);
        return res.json(updated.rows[0]);
    }
    catch (err) {
        console.error("Update Profile Error:", err);
        return res.status(500).json({
            message: "Failed to update profile",
        });
    }
};
exports.updateMe = updateMe;
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword, } = req.body;
        if (!oldPassword ||
            !newPassword) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }
        const userResult = await db_1.db.query(`
        SELECT password
        FROM users
        WHERE id = $1
        `, [userId]);
        const user = userResult.rows[0];
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        const valid = await bcrypt_1.default.compare(oldPassword, user.password);
        if (!valid) {
            return res.status(401).json({
                message: "Old password is incorrect",
            });
        }
        const hashed = await bcrypt_1.default.hash(newPassword, 10);
        await db_1.db.query(`
      UPDATE users
      SET password = $1
      WHERE id = $2
      `, [
            hashed,
            userId,
        ]);
        return res.json({
            message: "Password updated successfully",
        });
    }
    catch (err) {
        console.error("Change Password Error:", err);
        return res.status(500).json({
            message: "Failed to change password",
        });
    }
};
exports.changePassword = changePassword;
