import express from "express";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";

import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware quan trọng để parse JSON

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes); 
app.use(cors()); // Middleware để cho phép CORS


connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });