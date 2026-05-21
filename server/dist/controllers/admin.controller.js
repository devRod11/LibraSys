"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUploadStudents = void 0;
const csv_parser_1 = __importDefault(require("csv-parser"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const stream_1 = require("stream");
const db_1 = require("../db");
const bulkUploadStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "CSV file is required",
            });
        }
        const rows = [];
        const stream = stream_1.Readable.from(req.file.buffer);
        stream.pipe((0, csv_parser_1.default)()).on("data", (data) => { rows.push(data); }).on("end", async () => {
            let inserted = 0;
            for (const row of rows) {
                const cleanRow = {};
                for (const key in row) {
                    cleanRow[key.trim()] = row[key];
                }
                try {
                    const { full_name, email, password, role, two_fa_enabled, created_at, phone, student_id, course, year_level, } = cleanRow;
                    if (!full_name ||
                        !email ||
                        !password) {
                        console.log("Skipped row: Missing required fields", row);
                        continue;
                    }
                    const parsedCreatedAt = created_at
                        ? new Date(created_at)
                        : new Date();
                    const existing = await db_1.db.query(`
                  SELECT id
                  FROM users
                  WHERE email = $1
                  OR student_id = $2
                  `, [
                        email.trim().toLowerCase(),
                        student_id,
                    ]);
                    if (existing.rows.length > 0) {
                        console.log("Skipped duplicate:", email);
                        continue;
                    }
                    const hashed = await bcrypt_1.default.hash(password, 10);
                    const parsedRole = role === "admin"
                        ? "admin"
                        : "student";
                    const parsed2FA = String(two_fa_enabled)
                        .toLowerCase() === "true";
                    const parsedYear = year_level === "N/A"
                        ? null
                        : year_level;
                    await db_1.db.query(`
                INSERT INTO users (
                  full_name,
                  email,
                  password,
                  role,
                  two_fa_enabled,
                  created_at,
                  phone,
                  student_id,
                  course,
                  year_level
                )
                VALUES (
                  $1,
                  $2,
                  $3,
                  $4,
                  $5,
                  $6,
                  $7,
                  $8,
                  $9,
                  $10
                )
                `, [
                        full_name,
                        email.trim().toLowerCase(),
                        hashed,
                        parsedRole,
                        parsed2FA,
                        parsedCreatedAt,
                        phone,
                        student_id,
                        course,
                        parsedYear,
                    ]);
                    inserted++;
                }
                catch (rowErr) {
                    console.error("Row insert failed:", row, rowErr);
                }
            }
            return res.json({
                message: "Students uploaded successfully",
                inserted,
            });
        });
    }
    catch (err) {
        console.error("Bulk Upload Error:", err);
        return res.status(500).json({
            message: "Bulk upload failed",
        });
    }
};
exports.bulkUploadStudents = bulkUploadStudents;
