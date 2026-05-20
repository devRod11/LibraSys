import { Router } from "express";
import {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook
} from "../controllers/book.controller";

const router = Router();

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", addBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

export default router;