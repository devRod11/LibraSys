import { db } from "../db";
import { Request, Response } from "express";
import { logActivity } from "../utils/activityLogger";
import { getIO } from "../socket";

/**
 * Safe socket emitter (prevents Render crash)
 */
const emitSafe = (event: string) => {
  try {
    getIO().emit(event);
  } catch {
    // socket not ready yet (safe ignore)
  }
};

/**
 * BORROW BOOK
 */
export const borrowBook = async (req: Request, res: Response) => {
  const { user_id, book_id } = req.body;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. Get book
    const bookResult = await client.query(
      `SELECT * FROM books WHERE id = $1`,
      [book_id]
    );

    if (!bookResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Book not found" });
    }

    const book = bookResult.rows[0];

    const available = Number(book.copies_available ?? 0);

    if (available <= 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "No copies available" });
    }

    // 2. Prevent duplicate borrow
    const existingBorrow = await client.query(
      `
      SELECT 1 FROM borrow_records
      WHERE user_id = $1 AND book_id = $2 AND status = 'active'
      `,
      [user_id, book_id]
    );

    if (existingBorrow.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "User already borrowed this book",
      });
    }

    // 3. Dates
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(borrowDate.getDate() + 14);

    // 4. Insert borrow record
    await client.query(
      `
      INSERT INTO borrow_records (
        user_id,
        book_id,
        borrow_date,
        due_date,
        status
      )
      VALUES ($1, $2, $3, $4, 'active')
      `,
      [user_id, book_id, borrowDate, dueDate]
    );

    // 5. Update book availability
    await client.query(
      `
      UPDATE books
      SET copies_available = copies_available - 1
      WHERE id = $1
      `,
      [book_id]
    );

    await client.query("COMMIT");

    // 6. Logs + sockets
    await logActivity("BORROW_BOOK", "Book borrowed", user_id, book_id);

    emitSafe("booksUpdated");
    emitSafe("borrowUpdated");
    emitSafe("studentDashboardUpdated");

    return res.json({
      message: "Book borrowed successfully",
      dueDate,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);

    const error = err as Error;
    return res.status(500).json({
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * RETURN BOOK
 */
export const returnBook = async (req: Request, res: Response) => {
  const { user_id, book_id } = req.body;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const borrowResult = await client.query(
      `
      UPDATE borrow_records
      SET status = 'returned',
          return_date = NOW()
      WHERE user_id = $1
        AND book_id = $2
        AND status = 'active'
      RETURNING *
      `,
      [user_id, book_id]
    );

    if (!borrowResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Active borrow record not found",
      });
    }

    await client.query(
      `
      UPDATE books
      SET copies_available = copies_available + 1
      WHERE id = $1
      `,
      [book_id]
    );

    await client.query("COMMIT");

    await logActivity("RETURN_BOOK", "Book returned", user_id, book_id);

    emitSafe("booksUpdated");
    emitSafe("borrowUpdated");
    emitSafe("studentDashboardUpdated");

    return res.json({
      message: "Book returned successfully",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);

    const error = err as Error;
    return res.status(500).json({
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * ACTIVE BORROWS
 */
export const getBorrowedBooks = async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `
      SELECT br.*, u.full_name, b.title
      FROM borrow_records br
      JOIN users u ON br.user_id = u.id
      JOIN books b ON br.book_id = b.id
      WHERE br.status = 'active'
      ORDER BY br.borrow_date DESC
      `
    );

    return res.json(result.rows);
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: error.message });
  }
};

/**
 * FULL HISTORY
 */
export const getBorrowHistory = async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `
      SELECT br.*, u.full_name, b.title
      FROM borrow_records br
      JOIN users u ON br.user_id = u.id
      JOIN books b ON br.book_id = b.id
      ORDER BY br.borrow_date DESC
      `
    );

    return res.json(result.rows);
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: error.message });
  }
};
