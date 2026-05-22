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
