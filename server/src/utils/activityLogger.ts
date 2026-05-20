import { db } from "../db";

export const logActivity = async (
  action: string,
  description: string,
  user_id?: number,
  book_id?: number
) => {
  await db.query(
    `INSERT INTO activity_logs 
    (action, description, user_id, book_id, created_at)
    VALUES ($1, $2, $3, $4, NOW())`,
    [action, description, user_id || null, book_id || null]
  );
};