"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBorrowHistory = exports.getBorrowedBooks = exports.returnBook = exports.borrowBook = void 0;
const db_1 = require("../db");
const activityLogger_1 = require("../utils/activityLogger");
const socket_1 = require("../socket");
// 📚 Borrow Book
const borrowBook = async (req, res) => {
    const { user_id, book_id } = req.body;
    try {
        // 1. Check book
        const bookResult = await db_1.db.query(`
      SELECT *
      FROM books
      WHERE id = $1
      `, [book_id]);
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
        const existingBorrow = await db_1.db.query(`
        SELECT *
        FROM borrow_records
        WHERE
        user_id = $1
        AND book_id = $2
        AND status = 'active'
        `, [user_id, book_id]);
        if (existingBorrow.rows.length > 0) {
            return res.status(400).json({
                message: "User already borrowed this book"
            });
        }
        // 3. Dates
        const borrowDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(borrowDate.getDate() + 14);
        await db_1.db.query("BEGIN");
        try {
            // 4. Insert borrow record
            await db_1.db.query(`
        INSERT INTO borrow_records
        (
          user_id,
          book_id,
          borrow_date,
          due_date,
          status
        )
        VALUES ($1, $2, $3, $4, 'active')
        `, [
                user_id,
                book_id,
                borrowDate,
                dueDate
            ]);
            // 5. Reduce available copies
            await db_1.db.query(`
        UPDATE books
        SET copies_available = copies_available - 1
        WHERE id = $1
        `, [book_id]);
            await db_1.db.query("COMMIT");
        }
        catch (err) {
            await db_1.db.query("ROLLBACK");
            throw err;
        }
        // 6. Log activity
        await (0, activityLogger_1.logActivity)("BORROW_BOOK", "Book borrowed", user_id, book_id);
        (0, socket_1.getIO)().emit("booksUpdated");
        (0, socket_1.getIO)().emit("borrowUpdated");
        (0, socket_1.getIO)().emit("studentDashboardUpdated");
        res.json({
            message: "Book borrowed successfully",
            dueDate
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
};
exports.borrowBook = borrowBook;
// 🔄 Return Book
const returnBook = async (req, res) => {
    const { user_id, book_id } = req.body;
    try {
        await db_1.db.query("BEGIN");
        try {
            // 1. Update borrow record
            const borrowResult = await db_1.db.query(`
        UPDATE borrow_records
        SET
          status = 'returned',
          return_date = NOW()
        WHERE
          user_id = $1
          AND book_id = $2
          AND status = 'active'
        RETURNING *
        `, [user_id, book_id]);
            if (borrowResult.rows.length === 0) {
                await db_1.db.query("ROLLBACK");
                return res.status(404).json({
                    message: "Active borrow record not found"
                });
            }
            // 2. Increase available copies
            await db_1.db.query(`
        UPDATE books
        SET copies_available = copies_available + 1
        WHERE id = $1
        `, [book_id]);
            await db_1.db.query("COMMIT");
        }
        catch (err) {
            await db_1.db.query("ROLLBACK");
            throw err;
        }
        // 3. Log activity
        await (0, activityLogger_1.logActivity)("RETURN_BOOK", "Book returned", user_id, book_id);
        (0, socket_1.getIO)().emit("booksUpdated");
        (0, socket_1.getIO)().emit("borrowUpdated");
        (0, socket_1.getIO)().emit("studentDashboardUpdated");
        res.json({
            message: "Book returned successfully"
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
};
exports.returnBook = returnBook;
// 📖 Active Borrowed Books
const getBorrowedBooks = async (req, res) => {
    try {
        const result = await db_1.db.query(`
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
      `);
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};
exports.getBorrowedBooks = getBorrowedBooks;
// 📜 Borrow History
const getBorrowHistory = async (req, res) => {
    try {
        const result = await db_1.db.query(`
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
      `);
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};
exports.getBorrowHistory = getBorrowHistory;
