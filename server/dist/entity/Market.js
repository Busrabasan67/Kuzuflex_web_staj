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
exports.Market = void 0;
const typeorm_1 = require("typeorm");
const MarketTranslation_1 = require("./MarketTranslation");
const ProductGroup_1 = require("./ProductGroup");
const Solution_1 = require("./Solution");
const MarketContent_1 = require("./MarketContent");
let Market = class Market {
};
exports.Market = Market;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Market.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Market.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Market.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Market.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Market.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Market.prototype, "hasProducts", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Market.prototype, "hasSolutions", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Market.prototype, "hasCertificates", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'GETDATE()' }),
    __metadata("design:type", Date)
], Market.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'GETDATE()', onUpdate: 'GETDATE()' }),
    __metadata("design:type", Date)
], Market.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => MarketTranslation_1.MarketTranslation, (translation) => translation.market, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Market.prototype, "translations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProductGroup_1.ProductGroup, (productGroup) => productGroup.market),
    __metadata("design:type", Array)
], Market.prototype, "productGroups", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Solution_1.Solution, (solution) => solution.market),
    __metadata("design:type", Array)
], Market.prototype, "solutions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => MarketContent_1.MarketContent, (content) => content.market),
    __metadata("design:type", Array)
], Market.prototype, "contents", void 0);
exports.Market = Market = __decorate([
    (0, typeorm_1.Entity)()
], Market);
