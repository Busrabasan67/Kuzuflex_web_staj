"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const Product_1 = require("./entity/Product");
const Catalog_1 = require("./entity/Catalog");
const Admin_1 = require("./entity/Admin");
const ProductGroup_1 = require("./entity/ProductGroup");
const AppDataSource = new typeorm_1.DataSource({
    type: "mssql",
    host: "localhost",
    port: 1433,
    username: "sa",
    password: "busra1234",
    database: "KuzuflexDB",
    synchronize: false,
    logging: false,
    entities: [Product_1.Product, Catalog_1.Catalog, Admin_1.Admin, ProductGroup_1.ProductGroup],
    migrations: [__dirname + "/migrations/*.ts"],
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
});
AppDataSource.initialize()
    .then(() => {
    console.log("✅ Veritabanı bağlantısı başarılı (data-source.ts)");
})
    .catch((err) => {
    console.error("Veritabanı bağlantı hatası:", err);
});
exports.default = AppDataSource;
