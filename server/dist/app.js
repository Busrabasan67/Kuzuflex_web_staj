"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const ProductGroupRoutes_1 = __importDefault(require("./routes/ProductGroupRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const solutionRoutes_1 = __importDefault(require("./routes/solutionRoutes"));
const solutionExtraContentRoutes_1 = __importDefault(require("./routes/solutionExtraContentRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const catalogRoutes_1 = __importDefault(require("./routes/catalogRoutes"));
const qmDocumentsAndCertificatesRoutes_1 = __importDefault(require("./routes/qmDocumentsAndCertificatesRoutes"));
const marketRoutes_1 = __importDefault(require("./routes/marketRoutes"));
const aboutPageRoutes_1 = __importDefault(require("./routes/aboutPageRoutes"));
const aboutPageExtraContentRoutes_1 = __importDefault(require("./routes/aboutPageExtraContentRoutes"));
const homeRoutes_1 = __importDefault(require("./routes/homeRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const emailSettingsRoutes_1 = __importDefault(require("./routes/emailSettingsRoutes"));
const app = (0, express_1.default)();
// Middleware'ler
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express_1.default.json());
// Static dosya servisi
app.use("/uploads", (0, cors_1.default)({
    origin: "http://localhost:5173",
    methods: ["GET"],
    allowedHeaders: ["Content-Type"]
}), express_1.default.static(path_1.default.join(__dirname, "../public/uploads")));
// Route'lar
app.use("/api/auth", authRoutes_1.default);
app.use("/api/product-groups", ProductGroupRoutes_1.default);
app.use("/api/products", productRoutes_1.default);
app.use("/api/solutions", solutionRoutes_1.default);
app.use("/api/solution-extra-content", solutionExtraContentRoutes_1.default);
app.use("/api/upload", uploadRoutes_1.default);
app.use("/api/catalogs", catalogRoutes_1.default);
app.use("/api/qm-documents-and-certificates", qmDocumentsAndCertificatesRoutes_1.default);
app.use("/api/markets", marketRoutes_1.default);
app.use("/api/about-page", aboutPageRoutes_1.default);
app.use("/api/about-page-extra-content", aboutPageExtraContentRoutes_1.default);
app.use("/api/home", homeRoutes_1.default);
app.use("/api/contact", contactRoutes_1.default);
app.use("/api/email-settings", emailSettingsRoutes_1.default);
exports.default = app;
