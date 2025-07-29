import express from "express";
import cors from "cors";
import productGroupRoutes from "./routes/ProductGroupRoutes";
import productRoutes from "./routes/productRoutes";
import solutionRoutes from "./routes/solutionRoutes";

const app = express();

// Middleware'ler
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Route'lar
app.use("/api/product-groups", productGroupRoutes);// route'un ana adresini tanımlar.

app.use("/api/products", productRoutes);

app.use("/api/solutions", solutionRoutes);

export default app;
