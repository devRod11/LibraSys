"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const db_1 = require("../db");
const logActivity = async (action, description, user_id, book_id) => {
    await db_1.db.query(`INSERT INTO activity_logs 
    (action, description, user_id, book_id, created_at)
    VALUES ($1, $2, $3, $4, NOW())`, [action, description, user_id || null, book_id || null]);
};
exports.logActivity = logActivity;
