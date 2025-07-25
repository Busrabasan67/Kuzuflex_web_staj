import express from "express";
import productGroupRoutes from "./routes/ProductGroupRoutes";
import productRoutes from "./routes/productRoutes";

const app = express();

app.use(express.json());

// örnek endpoint
app.get("/", (req, res) => {
  res.send("Merhaba Kuzuflex 🚀");
});

app.use("/api/product-groups", productGroupRoutes);// route'un ana adresini tanımlar.


app.use("/api/products", productRoutes);


export default app;
