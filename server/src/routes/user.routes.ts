import express from "express";
import {getMe, updateMe, changePassword,} from "../controllers/user.controller";
import  verifyToken,} from "../middleware/auth.middleware";

const router = express.Router();

router.get( "/me", verifyToken, getMe );
router.put( "/me", verifyToken, updateMe );
router.put( "/change-password", verifyToken, changePassword );

export default router;
