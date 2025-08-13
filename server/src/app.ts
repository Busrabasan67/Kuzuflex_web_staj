import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/authRoutes";
import productGroupRoutes from "./routes/ProductGroupRoutes";
import productRoutes from "./routes/productRoutes";
import solutionRoutes from "./routes/solutionRoutes";
import solutionExtraContentRoutes from "./routes/solutionExtraContentRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import catalogRoutes from "./routes/catalogRoutes";
import qmDocumentsAndCertificatesRoutes from "./routes/qmDocumentsAndCertificatesRoutes";
import marketRoutes from "./routes/marketRoutes";
import pageRoutes from "./routes/pageRoutes";
import aboutPageRoutes from "./routes/aboutPageRoutes";
import aboutPageExtraContentRoutes from "./routes/aboutPageExtraContentRoutes";
import homeRoutes from "./routes/homeRoutes";
import contactRoutes from "./routes/contactRoutes";
import emailSettingsRoutes from "./routes/emailSettingsRoutes";


const app = express();

// Middleware'ler
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Static dosya servisi
app.use("/uploads", cors({
  origin: "http://localhost:5173",
  methods: ["GET"],
  allowedHeaders: ["Content-Type"]
}), express.static(path.join(__dirname, "../public/uploads")));

// Route'lar
app.use("/api/auth", authRoutes);
app.use("/api/product-groups", productGroupRoutes);
app.use("/api/products", productRoutes);
app.use("/api/solutions", solutionRoutes);
app.use("/api/solution-extra-content", solutionExtraContentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/catalogs", catalogRoutes);
app.use("/api/qm-documents-and-certificates", qmDocumentsAndCertificatesRoutes);
app.use("/api/markets", marketRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/about-page", aboutPageRoutes);
app.use("/api/about-page-extra-content", aboutPageExtraContentRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/email-settings", emailSettingsRoutes);


export default app;
