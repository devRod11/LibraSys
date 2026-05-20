import { Router } from "express";
import { db } from "../db";

const router = Router();

router.get("/db-test", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully!",
      time: result.rows[0].now,
    });
  } catch (err: any) {
    console.error("DB ERROR:", err.message);

    res.status(500).json({
      error: "Database connection failed",
      details: err.message,
    });
  }
});
export default router;