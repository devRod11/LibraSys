import express from "express";
import { bulkUploadStudents,getStudents,deleteStudent, } from "../controllers/admin.controller";
import { verifyToken, } from "../middleware/auth.middleware";
import { upload, } from "../middleware/upload.middleware";
import { bulkUploadLimiter, } from "../middleware/rateLimit.middleware";

const router = express.Router();

router.post("/students/bulk-upload", verifyToken, bulkUploadLimiter, upload.single("file"), bulkUploadStudents);
router.get("/students", verifyToken, getStudents);
router.delete("/students/:id", verifyToken, deleteStudent);

export default router;
