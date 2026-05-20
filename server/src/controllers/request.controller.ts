import { Request, Response } from "express";
import { db } from "../db";
import { logActivity } from "../utils/activityLogger";
import { getIO } from "../socket";


export const createBookRequest = async (req: Request, res: Response) => {
  const { user_id, book_id } = req.body;

  try {
    // Check if book exists
    const book = await db.query(
      "SELECT * FROM books WHERE id = $1",
      [book_id]
    );

    if (book.rows.length === 0) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    // Prevent duplicate pending requests
    const existing = await db.query(
      `
      SELECT * FROM book_requests
      WHERE user_id = $1
      AND book_id = $2
      AND status = 'pending'
      `,
      [user_id, book_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "You already have a pending request for this book"
      });
    }

    // Create request
    const result = await db.query(
      `
      INSERT INTO book_requests
      (
        user_id,
        book_id,
        request_date,
        status
      )
      VALUES
      (
        $1,
        $2,
        NOW(),
        'pending'
      )
      RETURNING *
      `,
      [user_id, book_id]
    );

    await logActivity(
      "CREATE_BOOK_REQUEST",
      "Book request submitted",
      user_id,
      book_id
    );
    getIO().emit("requestsUpdated");
    getIO().emit("dashboardUpdated");

    res.status(201).json({
      message: "Book request submitted successfully",
      request: result.rows[0]
    });

  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
};

export const approveBookRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { admin_id } = req.body;

  try {
    // Get request
    const requestResult = await db.query(
      `
      SELECT *
      FROM book_requests
      WHERE id = $1
      `,
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        message: "Request not found"
      });
    }

    const request = requestResult.rows[0];

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Request already processed"
      });
    }

    // Check available copies
    const bookResult = await db.query(
      `
      SELECT *
      FROM books
      WHERE id = $1
      `,
      [request.book_id]
    );

    const book = bookResult.rows[0];

    if (book.available <= 0) {
      return res.status(400).json({
        message: "No copies available"
      });
    }

    await db.query("BEGIN");

    try {
      // Approve request
      await db.query(
        `
        UPDATE book_requests
        SET
          status = 'approved',
          admin_id = $1,
          response_date = NOW()
        WHERE id = $2
        `,
        [admin_id, id]
      );

      // Create borrow record
      await db.query(
        `
        INSERT INTO borrow_records
        (
          user_id,
          book_id,
          borrow_date,
          due_date,
          status
        )
        VALUES
        (
          $1,
          $2,
          NOW(),
          NOW() + INTERVAL '14 days',
          'borrowed'
        )
        `,
        [request.user_id, request.book_id]
      );

      // Decrease available copies
      await db.query(
        `
        UPDATE books
        SET copies_available = copies_available - 1
        WHERE id = $1
        `,
        [request.book_id]
      );

      await db.query("COMMIT");

    } catch (err) {
      await db.query("ROLLBACK");
      throw err;
    }

    await logActivity(
      "APPROVE_BOOK_REQUEST",
      "Book request approved",
      request.user_id,
      request.book_id
    );
    getIO().emit("requestsUpdated");
    getIO().emit("booksUpdated");
    getIO().emit("borrowUpdated");
    getIO().emit("dashboardUpdated");

    res.json({
      message: "Book request approved successfully"
    });

  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
};

export const rejectBookRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { admin_id, remarks } = req.body;

  try {
    const result = await db.query(
      `
      UPDATE book_requests
      SET
        status = 'rejected',
        admin_id = $1,
        response_date = NOW(),
        remarks = $2
      WHERE id = $3
      RETURNING *
      `,
      [admin_id, remarks || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Request not found"
      });
    }

    const request = result.rows[0];

    await logActivity(
      "DECLINE_BOOK_REQUEST",
      "Book request rejected",
      request.user_id,
      request.book_id
    );
    getIO().emit("requestsUpdated");
    getIO().emit("dashboardUpdated");

    res.json({
      message: "Book request rejected successfully"
    });

  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
};

export const getAllRequests = async (
  req: Request,
  res: Response
) => {
  try {

    const result = await db.query(`
      SELECT
        br.id,
        br.user_id,
        br.book_id,
        br.request_date,
        br.response_date,
        br.status,
        br.remarks,

        u.full_name,

        b.title

      FROM book_requests br

      JOIN users u
        ON br.user_id = u.id

      JOIN books b
        ON br.book_id = b.id

      ORDER BY br.request_date DESC
    `);

    res.json(result.rows);

  } catch (err: any) {

    console.error("GET REQUESTS ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

export const deleteRequest = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `
      DELETE FROM book_requests
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    res.json({
      message: "Request cancelled successfully",
    });

  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      message: "Failed to cancel request",
      error: err.message,
    });
  }
};

export const returnBook = async (req: Request, res: Response) => {
  const { user_id, book_id } = req.body;

  try {
    // Find active borrow record
    const borrowResult = await db.query(
      `
      SELECT *
      FROM borrow_records
      WHERE user_id = $1
        AND book_id = $2
        AND status = 'borrowed'
      ORDER BY borrow_date DESC
      LIMIT 1
      `,
      [user_id, book_id]
    );

    if (borrowResult.rows.length === 0) {
      return res.status(404).json({
        message: "No active borrowed record found",
      });
    }

    const borrow = borrowResult.rows[0];

    await db.query("BEGIN");

    try {
      // Mark as returned
      await db.query(
        `
        UPDATE borrow_records
        SET
          status = 'returned',
          return_date = NOW()
        WHERE id = $1
        `,
        [borrow.id]
      );

      // Increase available copies
      await db.query(
        `
        UPDATE books
        SET copies_available = copies_available + 1
        WHERE id = $1
        `,
        [book_id]
      );

      await db.query("COMMIT");
    } catch (err) {
      await db.query("ROLLBACK");
      throw err;
    }

    await logActivity(
      "RETURN_BOOK",
      "Book returned",
      user_id,
      book_id
    );

    getIO().emit("borrowUpdated");
    getIO().emit("booksUpdated");
    getIO().emit("dashboardUpdated");

    res.json({
      message: "Book returned successfully",
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};