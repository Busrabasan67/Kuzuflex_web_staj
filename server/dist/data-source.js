"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const Product_1 = require("./entity/Product");
const Catalog_1 = require("./entity/Catalog");
const Admin_1 = require("./entity/Admin");
const ProductGroup_1 = require("./entity/ProductGroup");
const ProductTranslation_1 = require("./entity/ProductTranslation");
const ProductGroupTranslation_1 = require("./entity/ProductGroupTranslation");
const CatalogTranslation_1 = require("./entity/CatalogTranslation");
const Solution_1 = require("./entity/Solution");
const SolutionTranslation_1 = require("./entity/SolutionTranslation");
const SolutionExtraContent_1 = require("./entity/SolutionExtraContent");
const QMDocumentsAndCertificates_1 = require("./entity/QMDocumentsAndCertificates");
const QMDocumentsAndCertificatesTranslation_1 = require("./entity/QMDocumentsAndCertificatesTranslation");
const Market_1 = require("./entity/Market");
const MarketContent_1 = require("./entity/MarketContent");
const MarketTranslation_1 = require("./entity/MarketTranslation");
const AboutPage_1 = require("./entity/AboutPage");
const AboutPageTranslation_1 = require("./entity/AboutPageTranslation");
const AboutPageExtraContent_1 = require("./entity/AboutPageExtraContent");
const AppDataSource = new typeorm_1.DataSource({
    type: "mssql",
    host: "localhost",
    port: 1433,
    username: "sa",
    password: "busra1234",
    database: "KuzuflexDB",
    synchronize: false,
    logging: false,
    entities: [Product_1.Product, Catalog_1.Catalog, Admin_1.Admin, ProductGroup_1.ProductGroup, ProductTranslation_1.ProductTranslation, ProductGroupTranslation_1.ProductGroupTranslation, CatalogTranslation_1.CatalogTranslation, Solution_1.Solution, SolutionTranslation_1.SolutionTranslation, SolutionExtraContent_1.SolutionExtraContent, QMDocumentsAndCertificates_1.QMDocumentsAndCertificates, QMDocumentsAndCertificatesTranslation_1.QMDocumentsAndCertificatesTranslations, Market_1.Market, MarketContent_1.MarketContent, MarketTranslation_1.MarketTranslation, AboutPage_1.AboutPage, AboutPageTranslation_1.AboutPageTranslation, AboutPageExtraContent_1.AboutPageExtraContent],
    migrations: [__dirname + "/migrations/*.ts"],
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
});
exports.default = AppDataSource;
