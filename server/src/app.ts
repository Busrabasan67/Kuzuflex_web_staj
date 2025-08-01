import express from "express";
import cors from "cors";
import path from "path";
import productGroupRoutes from "./routes/ProductGroupRoutes";
import productRoutes from "./routes/productRoutes";
import solutionRoutes from "./routes/solutionRoutes";
import solutionExtraContentRoutes from "./routes/solutionExtraContentRoutes";
import uploadRoutes from "./routes/uploadRoutes";

const app = express();

// Middleware'ler
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Static dosya servisi
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Route'lar
app.use("/api/product-groups", productGroupRoutes);
app.use("/api/products", productRoutes);
app.use("/api/solutions", solutionRoutes);
app.use("/api/solution-extra-content", solutionExtraContentRoutes);
app.use("/api/upload", uploadRoutes);

export default app;
