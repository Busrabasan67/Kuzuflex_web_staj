"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogTranslation = void 0;
const typeorm_1 = require("typeorm");
const Catalog_1 = require("./Catalog");
let CatalogTranslation = class CatalogTranslation {
};
exports.CatalogTranslation = CatalogTranslation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CatalogTranslation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CatalogTranslation.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "nvarchar", length: 255, nullable: true }) // ✅ nullable ekle
    ,
    __metadata("design:type", String)
], CatalogTranslation.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Catalog_1.Catalog, catalog => catalog.translations, { onDelete: "CASCADE" }),
    __metadata("design:type", Catalog_1.Catalog)
], CatalogTranslation.prototype, "catalog", void 0);
exports.CatalogTranslation = CatalogTranslation = __decorate([
    (0, typeorm_1.Entity)()
], CatalogTranslation);
