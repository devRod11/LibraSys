import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

import bookRoutes from "./routes/book.routes";
import authRoutes from "./routes/auth.routes";
import requestRoutes from "./routes/request.routes";
import borrowRoutes from "./routes/borrow.routes";
import logRoutes from "./routes/log.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";

dotenv.config();

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("LibraSys API Running 🚀");
});

app.use(helmet());
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/logs", logRoutes); 
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin",adminRoutes);

export default app;