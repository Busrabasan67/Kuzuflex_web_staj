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
exports.Product = void 0;
const typeorm_1 = require("typeorm");
// src/entity/Product.ts
const ProductGroup_1 = require("./ProductGroup");
const Catalog_1 = require("./Catalog");
//alta başlıklar
let Product = class Product {
};
exports.Product = Product;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Product.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "standard", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProductGroup_1.ProductGroup, group => group.products, { nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", ProductGroup_1.ProductGroup)
], Product.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product, (product) => product.children, {
        onDelete: 'NO ACTION', // veya hiç yazma
    }),
    __metadata("design:type", Product)
], Product.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Product, product => product.parent),
    __metadata("design:type", Array)
], Product.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Catalog_1.Catalog, catalog => catalog.product),
    __metadata("design:type", Array)
], Product.prototype, "catalogs", void 0);
exports.Product = Product = __decorate([
    (0, typeorm_1.Entity)()
], Product);
