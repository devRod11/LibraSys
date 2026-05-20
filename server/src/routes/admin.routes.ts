import express from "express";
import { bulkUploadStudents, } from "../controllers/admin.controller";
import { verifyToken, } from "../middleware/auth.middleware";
import { upload, } from "../middleware/upload.middleware";
import { bulkUploadLimiter, } from "../middleware/rateLimit.middleware";

const router = express.Router();

router.post(
  "/students/bulk-upload",
  verifyToken,
  bulkUploadLimiter,
  upload.single("file"),
  bulkUploadStudents
);

export default router;