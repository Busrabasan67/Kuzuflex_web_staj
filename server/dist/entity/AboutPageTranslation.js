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
exports.AboutPageTranslation = void 0;
const typeorm_1 = require("typeorm");
const AboutPage_1 = require("./AboutPage");
let AboutPageTranslation = class AboutPageTranslation {
};
exports.AboutPageTranslation = AboutPageTranslation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AboutPageTranslation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ length: 5 }),
    __metadata("design:type", String)
], AboutPageTranslation.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AboutPageTranslation.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AboutPageTranslation.prototype, "subtitle", void 0);
__decorate([
    (0, typeorm_1.Column)("nvarchar", { length: "MAX" }),
    __metadata("design:type", String)
], AboutPageTranslation.prototype, "bodyHtml", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => AboutPage_1.AboutPage, (p) => p.translations, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "pageId" }),
    __metadata("design:type", AboutPage_1.AboutPage)
], AboutPageTranslation.prototype, "page", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "datetime" }),
    __metadata("design:type", Date)
], AboutPageTranslation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: "datetime" }),
    __metadata("design:type", Date)
], AboutPageTranslation.prototype, "updatedAt", void 0);
exports.AboutPageTranslation = AboutPageTranslation = __decorate([
    (0, typeorm_1.Entity)({ name: "about_page_translation" }),
    (0, typeorm_1.Unique)(["page", "language"]) // Her sayfa için her dil tekil olmalı
], AboutPageTranslation);
