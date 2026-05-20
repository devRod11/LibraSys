import { Request, Response, } from "express";
import multer from "multer";
import csv from "csv-parser";
import bcrypt from "bcrypt";
import { Readable } from "stream";
import { db } from "../db";

export const bulkUploadStudents =
  async ( req: Request & { file?: Express.Multer.File; }, res: Response ) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message:
            "CSV file is required",
        });
      }
      
      const rows: any[] = [];
      const stream = Readable.from(
        req.file.buffer
      );
      stream.pipe(csv()).on("data", (data) => {rows.push(data);}).on("end", async () => {
          let inserted = 0;

          
          for (const row of rows) {

            const cleanRow: any = {};
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

              if (
                !full_name ||
                !email ||
                !password
              ) {
                console.log(
                  "Skipped row: Missing required fields",
                  row
                );

                continue;
              }

              const parsedCreatedAt = created_at
                ? new Date(created_at)
                : new Date();

              const existing =
                await db.query(
                  `
                  SELECT id
                  FROM users
                  WHERE email = $1
                  OR student_id = $2
                  `,
                  [
                    email.trim().toLowerCase(),
                    student_id,
                  ]
                );

              if (
                existing.rows.length > 0
              ) {

                console.log(
                  "Skipped duplicate:",
                  email
                );

                continue;
              }

              const hashed =
                await bcrypt.hash(
                  password,
                  10
                );

              const parsedRole =
                role === "admin"
                  ? "admin"
                  : "student";

              const parsed2FA =
                String(two_fa_enabled)
                  .toLowerCase() === "true";

              const parsedYear =
                year_level === "N/A"
                  ? null
                  : year_level;

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
                VALUES (
                  $1,
                  $2,
                  $3,
                  $4,
                  $5,
                  $6,
                  $7,
                  $8,
                  $9,
                  $10
                )
                `,
                [
                  full_name,
                  email.trim().toLowerCase(),
                  hashed,
                  parsedRole,
                  parsed2FA,
                  parsedCreatedAt,
                  phone,
                  student_id,
                  course,
                  parsedYear,
                ]
              );

              inserted++;

            } catch (rowErr) {

              console.error(
                "Row insert failed:",
                row,
                rowErr
              );

            }
          }

          return res.json({
            message:
              "Students uploaded successfully",
            inserted,
          });
        });
        } catch (err) {

      console.error(
        "Bulk Upload Error:",
        err
      );

      return res.status(500).json({
        message:
          "Bulk upload failed",
      });
    }
  };