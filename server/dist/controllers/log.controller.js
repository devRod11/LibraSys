"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllLogsAsRead = exports.markLogAsRead = exports.getLogsByBook = exports.getLogsByUser = exports.getAllLogs = void 0;
const db_1 = require("../db");
// 📋 Get all activity logs
const getAllLogs = async (req, res) => {
    try {
        const result = await db_1.db.query(`
      SELECT
        al.id,
        al.action,
        al.description,
        al.created_at,
        al.is_read,

        al.user_id,
        al.book_id,
        al.request_id,

        u.full_name,
        b.title AS book_title

      FROM activity_logs al

      LEFT JOIN users u
        ON al.user_id = u.id

      LEFT JOIN books b
        ON al.book_id = b.id

      ORDER BY al.created_at DESC
    `);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        });
    }
};
exports.getAllLogs = getAllLogs;
// 👤 Logs by user
const getLogsByUser = async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await db_1.db.query(`
      SELECT *
      FROM activity_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
      `, [user_id]);
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
};
exports.getLogsByUser = getLogsByUser;
// 📚 Logs by book
const getLogsByBook = async (req, res) => {
    const { book_id } = req.params;
    try {
        const result = await db_1.db.query(`
      SELECT *
      FROM activity_logs
      WHERE book_id = $1
      ORDER BY created_at DESC
      `, [book_id]);
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
};
exports.getLogsByBook = getLogsByBook;
const markLogAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db_1.db.query(`
      UPDATE activity_logs
      SET is_read = true
      WHERE id = $1
      RETURNING *
      `, [id]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        });
    }
};
exports.markLogAsRead = markLogAsRead;
const markAllLogsAsRead = async (req, res) => {
    try {
        await db_1.db.query(`
      UPDATE activity_logs
      SET is_read = true
      WHERE is_read = false
      `);
        res.json({
            message: "All notifications marked as read",
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        });
    }
};
exports.markAllLogsAsRead = markAllLogsAsRead;
