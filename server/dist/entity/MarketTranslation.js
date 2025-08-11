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
exports.MarketTranslation = void 0;
const typeorm_1 = require("typeorm");
const Market_1 = require("./Market");
let MarketTranslation = class MarketTranslation {
};
exports.MarketTranslation = MarketTranslation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MarketTranslation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MarketTranslation.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MarketTranslation.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 'MAX', nullable: true }),
    __metadata("design:type", String)
], MarketTranslation.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Market_1.Market, (market) => market.translations, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Market_1.Market)
], MarketTranslation.prototype, "market", void 0);
exports.MarketTranslation = MarketTranslation = __decorate([
    (0, typeorm_1.Entity)()
], MarketTranslation);
