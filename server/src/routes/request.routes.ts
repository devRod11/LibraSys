import { Router } from "express";

import {
  createBookRequest,
  approveBookRequest,
  rejectBookRequest,
  getAllRequests,
  deleteRequest,
  returnBook,
} from "../controllers/request.controller";

const router = Router();

router.post("/", createBookRequest);
router.get("/", getAllRequests);
router.put("/:id/approve", approveBookRequest);
router.put("/:id/reject", rejectBookRequest);
router.delete("/:id", deleteRequest);
router.post("/return", returnBook);

export default router;