import { db } from "../db";
import { Request, Response } from "express";
import { logActivity } from "../utils/activityLogger";
import { getIO } from "../socket";

// 📚 Borrow Book
export const borrowBook = async (req: Request, res: Response) => {
  const { user_id, book_id } = req.body;

  try {

    // 1. Check book
    const bookResult = await db.query(
      `
      SELECT *
      FROM books
      WHERE id = $1
      `,
      [book_id]
    );

    if (bookResult.rows.length === 0) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    const book = bookResult.rows[0];

    // 2. Check availability
    if (book.copies_available <= 0) {
      return res.status(400).json({
        message: "No copies available"
      });
    }

    const existingBorrow = await db.query(
      `
        SELECT *
        FROM borrow_records
        WHERE
        user_id = $1
        AND book_id = $2
        AND status = 'active'
        `,
      [user_id, book_id]
    );

    if (existingBorrow.rows.length > 0) {
      return res.status(400).json({
      message: "User already borrowed this book"
      });
    }

    // 3. Dates
    const borrowDate = new Date();

    const dueDate = new Date();
    dueDate.setDate(borrowDate.getDate() + 14);

    await db.query("BEGIN");

    try {

      // 4. Insert borrow record
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
        VALUES ($1, $2, $3, $4, 'active')
        `,
        [
          user_id,
          book_id,
          borrowDate,
          dueDate
        ]
      );

      // 5. Reduce available copies
      await db.query(
        `
        UPDATE books
        SET copies_available = copies_available - 1
        WHERE id = $1
        `,
        [book_id]
      );

      await db.query("COMMIT");

    } catch (err) {

      await db.query("ROLLBACK");
      throw err;
    }

    // 6. Log activity
    await logActivity(
      "BORROW_BOOK",
      "Book borrowed",
      user_id,
      book_id
    );
    getIO().emit("booksUpdated");
    getIO().emit("borrowUpdated");
    getIO().emit("studentDashboardUpdated");

    res.json({
      message: "Book borrowed successfully",
      dueDate
    });

  } catch (err: any) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
};

// 🔄 Return Book
export const returnBook = async (req: Request, res: Response) => {

  const { user_id, book_id } = req.body;

  try {

    await db.query("BEGIN");

    try {

      // 1. Update borrow record
      const borrowResult = await db.query(
        `
        UPDATE borrow_records
        SET
          status = 'returned',
          return_date = NOW()
        WHERE
          user_id = $1
          AND book_id = $2
          AND status = 'active'
        RETURNING *
        `,
        [user_id, book_id]
      );

      if (borrowResult.rows.length === 0) {

        await db.query("ROLLBACK");

        return res.status(404).json({
          message: "Active borrow record not found"
        });
      }

      // 2. Increase available copies
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

    // 3. Log activity
    await logActivity(
      "RETURN_BOOK",
      "Book returned",
      user_id,
      book_id
    );
    getIO().emit("booksUpdated");
    getIO().emit("borrowUpdated");
    getIO().emit("studentDashboardUpdated");

    res.json({
      message: "Book returned successfully"
    });

  } catch (err: any) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
};

// 📖 Active Borrowed Books
export const getBorrowedBooks = async (
  req: Request,
  res: Response
) => {

  try {

    const result = await db.query(
      `
      SELECT
        br.*,
        u.full_name,
        b.title

      FROM borrow_records br

      JOIN users u
        ON br.user_id = u.id

      JOIN books b
        ON br.book_id = b.id

      WHERE br.status = 'active'

      ORDER BY br.borrow_date DESC
      `
    );

    res.json(result.rows);

  } catch (err: any) {

    res.status(500).json({
      error: err.message
    });
  }
};

// 📜 Borrow History
export const getBorrowHistory = async (
  req: Request,
  res: Response
) => {

  try {

    const result = await db.query(
      `
      SELECT
        br.*,
        u.full_name,
        b.title

      FROM borrow_records br

      JOIN users u
        ON br.user_id = u.id

      JOIN books b
        ON br.book_id = b.id

      ORDER BY br.borrow_date DESC
      `
    );

    res.json(result.rows);

  } catch (err: any) {

    res.status(500).json({
      error: err.message
    });
  }
};