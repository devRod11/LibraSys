import {
  Request,
  Response,
} from "express";
import bcrypt from "bcrypt";
import { db } from "../db";

export const getMe = async (
  req: Request,
  res: Response
) => {

  try {

    const userId = req.user.id;

    const user = await db.query(
      `
      SELECT *
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    return res.json(
      user.rows[0]
    );

  } catch (err) {

    console.error(
      "Get Profile Error:",
      err
    );

    return res.status(500).json({
      message:
        "Failed to fetch profile",
    });

  }
};

export const updateMe = async (
  req: Request,
  res: Response
) => {

  try {

    const userId = req.user.id;

    const data = req.body;

    const updated = await db.query(
      `
      UPDATE users
      SET
        full_name = $1,
        email = $2,
        phone = $3,
        student_id = $4,
        course = $5,
        year_level = $6
      WHERE id = $7
      RETURNING *
      `,
      [
        data.full_name,
        data.email,
        data.phone,
        data.student_id,
        data.course,
        data.year_level,
        userId,
      ]
    );

    return res.json(
      updated.rows[0]
    );

  } catch (err) {

    console.error(
      "Update Profile Error:",
      err
    );

    return res.status(500).json({
      message:
        "Failed to update profile",
    });

  }
};

export const changePassword = async (
  req: Request,
  res: Response
) => {

  try {

    const userId = req.user.id;

    const {
      oldPassword,
      newPassword,
    } = req.body;

    if (
      !oldPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message:
          "All fields are required",
      });
    }

    const userResult =
      await db.query(
        `
        SELECT password
        FROM users
        WHERE id = $1
        `,
        [userId]
      );

    const user =
      userResult.rows[0];

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    const valid =
      await bcrypt.compare(
        oldPassword,
        user.password
      );

    if (!valid) {
      return res.status(401).json({
        message:
          "Old password is incorrect",
      });
    }

    const hashed =
      await bcrypt.hash(
        newPassword,
        10
      );

    await db.query(
      `
      UPDATE users
      SET password = $1
      WHERE id = $2
      `,
      [
        hashed,
        userId,
      ]
    );

    return res.json({
      message:
        "Password updated successfully",
    });

  } catch (err) {

    console.error(
      "Change Password Error:",
      err
    );

    return res.status(500).json({
      message:
        "Failed to change password",
    });
  }
};