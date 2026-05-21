"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBook = exports.updateBook = exports.addBook = exports.getBookById = exports.getBooks = void 0;
const db_1 = require("../db");
const activityLogger_1 = require("../utils/activityLogger");
const socket_1 = require("../socket");
const getBooks = async (req, res) => {
    try {
        const result = await db_1.db.query(`
      SELECT
        b.id,
        b.book_code,
        b.isbn,
        b.title,
        b.category,
        b.author,
        b.publisher,
        b.description,
        b.published_year,
        b.book_cover_url,
        b.copies_total,

        COALESCE(
          (b.copies_total - COUNT(br.id))::INT,
          b.copies_total
        ) AS available_copies

      FROM books b

      LEFT JOIN borrow_records br
        ON b.id = br.book_id
        AND br.return_date IS NULL

      GROUP BY
        b.id,
        b.book_code,
        b.isbn,
        b.title,
        b.category,
        b.author,
        b.publisher,
        b.description,
        b.published_year,
        b.book_cover_url,
        b.copies_total

      ORDER BY b.id
    `);
        res.json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch books"
        });
    }
};
exports.getBooks = getBooks;
const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.db.query("SELECT * FROM books WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};
exports.getBookById = getBookById;
const addBook = async (req, res) => {
    try {
        const { isbn, title, author, category, published_year, copies_total, book_cover_url, description, publisher, } = req.body;
        const book_code = `BOOK-${Date.now()}`;
        const result = await db_1.db.query(`
      INSERT INTO books
      (
        book_code,
        isbn,
        title,
        author,
        category,
        published_year,
        copies_total,
        book_cover_url,
        description,
        publisher
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `, [
            book_code,
            isbn,
            title,
            author,
            category,
            published_year,
            copies_total,
            book_cover_url,
            description,
            publisher,
        ]);
        await (0, activityLogger_1.logActivity)("CREATE_BOOK", "New book added", undefined, result.rows[0].id);
        (0, socket_1.getIO)().emit("booksUpdated");
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
};
exports.addBook = addBook;
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.db.query(`
      UPDATE books
      SET
        isbn = $1,
        title = $2,
        author = $3,
        category = $4,
        published_year = $5,
        copies_total = $6,
        book_cover_url = $7,
        description = $8,
        publisher = $9
      WHERE id = $10
      RETURNING *
      `, [
            req.body.isbn,
            req.body.title,
            req.body.author,
            req.body.category,
            req.body.published_year,
            req.body.copies_total,
            req.body.book_cover_url,
            req.body.description,
            req.body.publisher,
            id,
        ]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }
        await (0, activityLogger_1.logActivity)("UPDATE_BOOK", "Book updated", undefined, Number(id));
        (0, socket_1.getIO)().emit("booksUpdated");
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
};
exports.updateBook = updateBook;
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.db.query("DELETE FROM books WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }
        await (0, activityLogger_1.logActivity)("DELETE_BOOK", "Book deleted", undefined, Number(id));
        (0, socket_1.getIO)().emit("booksUpdated");
        res.json({
            message: "Book deleted successfully"
        });
    }
    catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};
exports.deleteBook = deleteBook;
