import express from "express";
import productGroupRoutes from "./routes/ProductGroupRoutes";

const app = express();

app.use(express.json());

// örnek endpoint
app.get("/", (req, res) => {
  res.send("Merhaba Kuzuflex 🚀");
});

app.use("/api/product-groups", productGroupRoutes);// route'un ana adresini tanımlar.

export default app;
