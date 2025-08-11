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
exports.ProductGroup = void 0;
const typeorm_1 = require("typeorm");
const Product_1 = require("./Product");
const ProductGroupTranslation_1 = require("./ProductGroupTranslation");
const Market_1 = require("./Market");
// Ürün gruplarının ortak verilerini tutan ana tablo
let ProductGroup = class ProductGroup {
};
exports.ProductGroup = ProductGroup;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProductGroup.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductGroup.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductGroup.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductGroup.prototype, "standard", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'GETDATE()' }),
    __metadata("design:type", Date)
], ProductGroup.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'GETDATE()', onUpdate: 'GETDATE()' }),
    __metadata("design:type", Date)
], ProductGroup.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Product_1.Product, (product) => product.group),
    __metadata("design:type", Array)
], ProductGroup.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProductGroupTranslation_1.ProductGroupTranslation, (translation) => translation.group, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], ProductGroup.prototype, "translations", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Market_1.Market, (market) => market.productGroups, { nullable: true }),
    __metadata("design:type", Market_1.Market)
], ProductGroup.prototype, "market", void 0);
exports.ProductGroup = ProductGroup = __decorate([
    (0, typeorm_1.Entity)()
], ProductGroup);
