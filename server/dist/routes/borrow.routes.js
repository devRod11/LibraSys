"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const borrow_controller_1 = require("../controllers/borrow.controller");
const router = (0, express_1.Router)();
// 📚 Borrow a book
router.post("/borrow", borrow_controller_1.borrowBook);
// 🔄 Return a book
router.post("/return", borrow_controller_1.returnBook);
// 📖 Get all active borrowed books (admin or student view)
router.get("/active", borrow_controller_1.getBorrowedBooks);
// 📜 Get full borrow history (returned + active)
router.get("/history", borrow_controller_1.getBorrowHistory);
exports.default = router;
