import { db } from "../db";
import { Request, Response } from "express";
import { logActivity } from "../utils/activityLogger";
import { getIO } from "../socket";

export const getBooks = async (req: Request, res: Response) => {
  try {
    const result = await db.query(`
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

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch books"
    });
  }
};

export const getBookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "SELECT * FROM books WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    res.json(result.rows[0]);

  } catch (err: any) {
    res.status(500).json({
      error: err.message
    });
  }
};

export const addBook = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      isbn,
      title,
      author,
      category,
      published_year,
      copies_total,
      book_cover_url,
      description,
      publisher,
    } = req.body;

    const book_code =
      `BOOK-${Date.now()}`;

    const result = await db.query(
      `
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
      `,
      [
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
      ]
    );

    await logActivity(
      "CREATE_BOOK",
      "New book added",
      undefined,
      result.rows[0].id
    );
    getIO().emit("booksUpdated");

    res.status(201).json(
      result.rows[0]
    );

  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
};

export const updateBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
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
      `,
      [
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
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    await logActivity(
      "UPDATE_BOOK",
      "Book updated",
      undefined,
      Number(id)
    );
    getIO().emit("booksUpdated");

    res.json(result.rows[0]);

  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM books WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    await logActivity(
      "DELETE_BOOK",
      "Book deleted",
      undefined,
      Number(id)
    );
    getIO().emit("booksUpdated");

    res.json({
      message: "Book deleted successfully"
    });

  } catch (err: any) {
    res.status(500).json({
      error: err.message
    });
  }
};