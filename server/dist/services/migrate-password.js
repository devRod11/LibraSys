"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
async function migratePasswords() {
    try {
        const users = await db_1.db.query(`
        SELECT id, password
        FROM users
      `);
        for (const user of users.rows) {
            if (user.password?.startsWith("$2b$")) {
                continue;
            }
            const hashed = await bcrypt_1.default.hash(user.password, 10);
            await db_1.db.query(`
        UPDATE users
        SET password = $1
        WHERE id = $2
        `, [
                hashed,
                user.id,
            ]);
            console.log(`Updated user ${user.id}`);
        }
        console.log("Migration complete");
        process.exit();
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}
migratePasswords();
