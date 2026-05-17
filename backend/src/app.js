import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import widgetRoutes from "./routes/widgetRoutes.js";
import formRoutes from "./routes/formRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/widgets", widgetRoutes);
app.use("/api/forms", formRoutes);

app.get("/api/health", (req, res) => {
  res.json({ code: 200, message: "OK", data: { status: "running" } });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
