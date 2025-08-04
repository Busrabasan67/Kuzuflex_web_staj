import "reflect-metadata";
import { DataSource } from "typeorm";
import { Product } from "./entity/Product";
import { Catalog } from "./entity/Catalog";
import { Admin } from "./entity/Admin";
import { ProductGroup } from "./entity/ProductGroup";
import { ProductTranslation } from "./entity/ProductTranslation";
import { ProductGroupTranslation } from "./entity/ProductGroupTranslation";
import { CatalogTranslation } from "./entity/CatalogTranslation";
import { Solution } from "./entity/Solution";
import { SolutionTranslation } from "./entity/SolutionTranslation";
import { SolutionExtraContent } from "./entity/SolutionExtraContent";
import { QMDocumentsAndCertificates } from "./entity/QMDocumentsAndCertificates";
import { QMDocumentsAndCertificatesTranslations } from "./entity/QMDocumentsAndCertificatesTranslation";

const AppDataSource = new DataSource({
  type: "mssql",
  host: "localhost",
  port: 1433,
  username: "sa",
  password: "busra1234",
  database: "KuzuflexDB",
  synchronize: false,
  logging: false,
  entities: [Product, Catalog, Admin, ProductGroup, ProductTranslation, ProductGroupTranslation, CatalogTranslation, Solution, SolutionTranslation, SolutionExtraContent, QMDocumentsAndCertificates, QMDocumentsAndCertificatesTranslations],  
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
  .catch((err: any) => {
    console.error("Veritabanı bağlantı hatası:", err);
  });
  
  
export default AppDataSource;


