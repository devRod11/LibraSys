"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get("/me", auth_middleware_1.verifyToken, user_controller_1.getMe);
router.put("/me", auth_middleware_1.verifyToken, user_controller_1.updateMe);
router.put("/change-password", auth_middleware_1.verifyToken, user_controller_1.changePassword);
exports.default = router;
