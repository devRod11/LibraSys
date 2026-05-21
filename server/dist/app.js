"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const book_routes_1 = __importDefault(require("./routes/book.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const request_routes_1 = __importDefault(require("./routes/request.routes"));
const borrow_routes_1 = __importDefault(require("./routes/borrow.routes"));
const log_routes_1 = __importDefault(require("./routes/log.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "https://librasys-10.onrender.com",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.get("/", (req, res) => {
    res.send("LibraSys API Running 🚀");
});
app.use("/api/books", book_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/borrow", borrow_routes_1.default);
app.use("/api/requests", request_routes_1.default);
app.use("/api/logs", log_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
exports.default = app;
