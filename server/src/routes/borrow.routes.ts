import { Router } from "express";
import {
  borrowBook,
  returnBook,
  getBorrowedBooks,
  getBorrowHistory
} from "../controllers/borrow.controller";

const router = Router();

router.post("/borrow", borrowBook);
router.post("/return", returnBook);
router.get("/active", getBorrowedBooks);
router.get("/history", getBorrowHistory);

export default router;
