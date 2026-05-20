import { Router } from "express";
import {
  getDashboardStats,
  getBorrowTrends,
  getCategoryDistribution,
  getTopBorrowedBooks,
  getActiveUsers,
  getStudentDashboard,
} from "../controllers/dashboard.controller";
import {verifyToken,} from "../middleware/auth.middleware";

const router = Router();

router.get("/stats", getDashboardStats);

router.get("/borrow-trends", getBorrowTrends);

router.get("/categories", getCategoryDistribution);

router.get("/top-books", getTopBorrowedBooks);

router.get("/active-users", getActiveUsers);

router.get(
  "/student",verifyToken,getStudentDashboard);

export default router;