import bcrypt from "bcrypt";
import { db } from "../db";

async function migratePasswords() {

  try {

    const users =
      await db.query(`
        SELECT id, password
        FROM users
      `);

    for (const user of users.rows) {

      if (
        user.password?.startsWith(
          "$2b$"
        )
      ) {
        continue;
      }

      const hashed =
        await bcrypt.hash(
          user.password,
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
          user.id,
        ]
      );

      console.log(
        `Updated user ${user.id}`
      );
    }

    console.log(
      "Migration complete"
    );

    process.exit();

  } catch (err) {

    console.error(err);

    process.exit(1);
  }
}

migratePasswords();