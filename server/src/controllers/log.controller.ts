import { Request, Response } from "express";
import { db } from "../db";

// 📋 Get all activity logs
export const getAllLogs = async (
  req: Request,
  res: Response
) => {
  try {

    const result = await db.query(`
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

  } catch (err: any) {

    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};

// 👤 Logs by user
export const getLogsByUser = async (
  req: Request,
  res: Response
) => {

  const { user_id } = req.params;

  try {

    const result = await db.query(
      `
      SELECT *
      FROM activity_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [user_id]
    );

    res.json(result.rows);

  } catch (err: any) {

    res.status(500).json({
      error: err.message,
    });
  }
};

// 📚 Logs by book
export const getLogsByBook = async (
  req: Request,
  res: Response
) => {

  const { book_id } = req.params;

  try {

    const result = await db.query(
      `
      SELECT *
      FROM activity_logs
      WHERE book_id = $1
      ORDER BY created_at DESC
      `,
      [book_id]
    );

    res.json(result.rows);

  } catch (err: any) {

    res.status(500).json({
      error: err.message,
    });
  }
};

export const markLogAsRead = async (
  req: Request,
  res: Response
) => {

  const { id } = req.params;

  try {

    const result = await db.query(
      `
      UPDATE activity_logs
      SET is_read = true
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    res.json(result.rows[0]);

  } catch (err: any) {

    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};

export const markAllLogsAsRead = async (
  req: Request,
  res: Response
) => {

  try {

    await db.query(
      `
      UPDATE activity_logs
      SET is_read = true
      WHERE is_read = false
      `
    );

    res.json({
      message: "All notifications marked as read",
    });

  } catch (err: any) {

    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};