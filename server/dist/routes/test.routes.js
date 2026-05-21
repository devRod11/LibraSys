"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.get("/db-test", async (req, res) => {
    try {
        const result = await db_1.db.query("SELECT NOW()");
        res.json({
            message: "Database connected successfully!",
            time: result.rows[0].now,
        });
    }
    catch (err) {
        console.error("DB ERROR:", err.message);
        res.status(500).json({
            error: "Database connection failed",
            details: err.message,
        });
    }
});
exports.default = router;
