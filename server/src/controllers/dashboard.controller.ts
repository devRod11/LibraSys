import { Request, Response } from "express";
import { db } from "../db";
import { getIO } from "../socket";

export const getDashboardStats = async (
  req: Request,
  res: Response
) => {
  try {

    const totalBooks = await db.query(`
      SELECT COUNT(*) FROM books
    `);

    const borrowedBooks = await db.query(`
      SELECT COUNT(*)
      FROM borrow_records
      WHERE return_date IS NULL
    `);

    const overdueBooks = await db.query(`
      SELECT COUNT(*)
      FROM borrow_records
      WHERE due_date < NOW()
      AND return_date IS NULL
    `);

    const pendingRequests = await db.query(`
      SELECT COUNT(*)
      FROM book_requests
      WHERE status = 'pending'
    `);

    res.json({
      totalBooks: Number(totalBooks.rows[0].count),
      borrowedBooks: Number(borrowedBooks.rows[0].count),
      overdueBooks: Number(overdueBooks.rows[0].count),
      pendingRequests: Number(pendingRequests.rows[0].count),
    });

  } catch (err: any) {

    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};

export const getBorrowTrends = async (
  req: Request,
  res: Response
) => {

  try {

    const result = await db.query(`
      SELECT
        TO_CHAR(borrow_date, 'Dy') AS day,
        COUNT(*) AS borrows
      FROM borrow_records
      GROUP BY day
      ORDER BY MIN(borrow_date)
    `);

    res.json(result.rows);

  } catch (err: any) {

    res.status(500).json({
      error: err.message,
    });
  }
};

export const getCategoryDistribution = async (
  req: Request,
  res: Response
) => {

  try {

    const result = await db.query(`
      SELECT
        category AS name,
        COUNT(*)::INT AS value
      FROM books
      GROUP BY category
    `);

    res.json(result.rows);

  } catch (err: any) {

    res.status(500).json({
      error: err.message,
    });
  }
};

export const getTopBorrowedBooks = async (
  req: Request,
  res: Response
) => {

  try {

    const result = await db.query(`
      SELECT
        b.title,
        COUNT(*)::INT AS count
      FROM borrow_records br
      JOIN books b
        ON br.book_id = b.id
      GROUP BY b.title
      ORDER BY count DESC
      LIMIT 5
    `);

    res.json(result.rows);

  } catch (err: any) {

    res.status(500).json({
      error: err.message,
    });
  }
};

export const getActiveUsers = async (
  req: Request,
  res: Response
) => {

  try {

    const result = await db.query(`
      SELECT
        u.id,
        u.full_name AS name,
        COUNT(*)::INT AS borrows
      FROM borrow_records br
      JOIN users u
        ON br.user_id = u.id
      GROUP BY u.id, u.full_name
      ORDER BY borrows DESC
      LIMIT 5
    `);

    res.json(result.rows);

  } catch (err: any) {

    res.status(500).json({
      error: err.message,
    });
  }
};

export const getStudentDashboard =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

      // borrowed books
      const borrowed =
        await db.query(
          `
          SELECT
            br.id,
            br.book_id,

            b.title,
            b.author,

            br.borrow_date,
            br.due_date,
            br.return_date,

            CASE
              WHEN br.return_date IS NOT NULL
                THEN 'returned'

              WHEN br.due_date < NOW()
                THEN 'overdue'

              ELSE 'active'
            END AS status

          FROM borrow_records br

          JOIN books b
            ON br.book_id = b.id

          WHERE br.user_id = $1

          ORDER BY br.borrow_date DESC
          `,
          [userId]
        );

      // requests
      const requests =
      await db.query(
        `
        SELECT
          br.id,

          b.title AS book_title,

          br.status,

          br.request_date AS created_at

        FROM book_requests br

        JOIN books b
          ON br.book_id = b.id

        WHERE br.user_id = $1

        ORDER BY br.request_date DESC
        `,
        [userId]
      );
          return res.json({
        borrowed:
          borrowed.rows,

        requests:
          requests.rows,
      });

    } catch (err: any) {

      console.error(
        "Student Dashboard Error:",
        err
      );

      return res.status(500).json({
        error:
          err.message,
      });

    }
  };
