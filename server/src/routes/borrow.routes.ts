import { Router } from "express";
import {
  borrowBook,
  returnBook,
  getBorrowedBooks,
  getBorrowHistory
} from "../controllers/borrow.controller";

const router = Router();


// 📚 Borrow a book
router.post("/borrow", borrowBook);


// 🔄 Return a book
router.post("/return", returnBook);


// 📖 Get all active borrowed books (admin or student view)
router.get("/active", getBorrowedBooks);


// 📜 Get full borrow history (returned + active)
router.get("/history", getBorrowHistory);


export default router;