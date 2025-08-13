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
import { Market } from "./entity/Market";
import { MarketContent } from "./entity/MarketContent";
import { MarketTranslation } from "./entity/MarketTranslation";
import { AboutPage } from "./entity/AboutPage";
import { AboutPageTranslation } from "./entity/AboutPageTranslation";
import { AboutPageExtraContent } from "./entity/AboutPageExtraContent";
import { EmailSettings } from "./entity/EmailSettings";


const AppDataSource = new DataSource({
  type: "mssql",
  host: "localhost",
  port: 1433,
  username: "sa",
  password: "busra1234",
  database: "KuzuflexDB",
  synchronize: false,
  logging: false,
  entities: [Product, Catalog, Admin, ProductGroup, ProductTranslation, ProductGroupTranslation, CatalogTranslation, Solution, SolutionTranslation, SolutionExtraContent, QMDocumentsAndCertificates, QMDocumentsAndCertificatesTranslations, Market, MarketContent, MarketTranslation, AboutPage, AboutPageTranslation, AboutPageExtraContent, EmailSettings],  
  migrations: [__dirname + "/migrations/*.ts"],
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
});

export default AppDataSource;


