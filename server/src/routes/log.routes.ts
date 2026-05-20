import { Router } from "express";

import {
  getAllLogs,
  getLogsByUser,
  getLogsByBook,
  markLogAsRead,
  markAllLogsAsRead
} from "../controllers/log.controller";

const router = Router();

router.get("/", getAllLogs);
router.get("/user/:user_id", getLogsByUser);
router.get("/book/:book_id", getLogsByBook);
router.put("/:id/read", markLogAsRead);
router.put("/read-all", markAllLogsAsRead);

export default router;