import { Request, Response } from "express";
import csv from "csv-parser";
import bcrypt from "bcrypt";
import { Readable } from "stream";
import { db } from "../db";
import { sendStudentWelcomeEmail } from "../utils/mailer";

type MulterRequest = Request & {
  file?: Express.Multer.File;
};

export const bulkUploadStudents = async (
  req: MulterRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "CSV file is required",
      });
    }

    const rows: any[] = [];
    const stream = Readable.from(req.file.buffer);

    stream
      .pipe(csv())
      .on("data", (data: any) => {
        rows.push(data);
      })
      .on("end", async () => {
        let inserted = 0;

        for (const row of rows) {
          const cleanRow: Record<string, any> = {};

          for (const key in row) {
            cleanRow[key.trim()] = row[key];
          }

          try {
            const {
              full_name,
              email,
              password,
              role,
              two_fa_enabled,
              created_at,
              phone,
              student_id,
              course,
              year_level,
            } = cleanRow;

            if (!full_name || !email || !password) continue;

            const existing = await db.query(
              `
              SELECT id FROM users
              WHERE email = $1 OR student_id = $2
              `,
              [email.trim().toLowerCase(), student_id]
            );

            if (existing.rows.length > 0) continue;

            const hashed = await bcrypt.hash(password, 10);

            const parsedRole = role === "admin" ? "admin" : "student";

            const parsed2FA =
              String(two_fa_enabled).toLowerCase() === "true";

            const parsedYear =
              year_level === "N/A" ? null : year_level;

            await db.query(
              `
              INSERT INTO users (
                full_name,
                email,
                password,
                role,
                two_fa_enabled,
                created_at,
                phone,
                student_id,
                course,
                year_level
              )
              VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
              `,
              [
                full_name,
                email.trim().toLowerCase(),
                hashed,
                parsedRole,
                parsed2FA,
                created_at ? new Date(created_at) : new Date(),
                phone,
                student_id,
                course,
                parsedYear,
              ]
            );

            await sendStudentWelcomeEmail(
              email.trim().toLowerCase(),
              full_name,
              student_id,
              password
            );

            inserted++;
          } catch (rowErr) {
            console.error("Row insert failed:", row, rowErr);
          }
        }

        return res.json({
          message: "Students uploaded successfully",
          inserted,
        });
      });
  } catch (err) {
    console.error("Bulk Upload Error:", err);
    return res.status(500).json({
      message: "Bulk upload failed",
    });
  }
};

export const getStudents = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await db.query(
      `
      SELECT
        id,
        full_name,
        email,
        student_id,
        created_at
      FROM users
      WHERE role = 'student'
      ORDER BY created_at DESC
      `
    );

    return res.json({
      students: result.rows,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message:
        "Failed to fetch students",
    });
  }
};

export const deleteStudent = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const borrowedBooks =
      await db.query(
        `
        SELECT id
        FROM borrow_records
        WHERE user_id = $1
        AND status = 'borrowed'::borrow_status
        `,
        [id]
      );

    if (
      borrowedBooks.rows.length > 0
    ) {
      return res.status(400).json({
        message:
          "Cannot delete student with borrowed books",
      });
    }

    await db.query(
      `
      DELETE FROM activity_logs
      WHERE user_id = $1
      `,
      [id]
    );

    const deleted = await db.query(
      `
      DELETE FROM users
      WHERE id = $1
      AND role = 'student'
      RETURNING id
      `,
      [id]
    );

    if (
      deleted.rows.length === 0
    ) {
      return res.status(404).json({
        message:
          "Student not found",
      });
    }

    return res.json({
      message:
        "Student deleted successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message:
        "Failed to delete student",
    });
  }
};
