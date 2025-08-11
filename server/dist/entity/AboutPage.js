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
exports.AboutPage = void 0;
const typeorm_1 = require("typeorm");
const AboutPageTranslation_1 = require("./AboutPageTranslation");
const AboutPageExtraContent_1 = require("./AboutPageExtraContent");
let AboutPage = class AboutPage {
};
exports.AboutPage = AboutPage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AboutPage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AboutPage.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AboutPage.prototype, "heroImageUrl", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => AboutPageTranslation_1.AboutPageTranslation, (t) => t.page, { cascade: true }),
    __metadata("design:type", Array)
], AboutPage.prototype, "translations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => AboutPageExtraContent_1.AboutPageExtraContent, (c) => c.page, { cascade: true }),
    __metadata("design:type", Array)
], AboutPage.prototype, "extraContents", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "datetime" }),
    __metadata("design:type", Date)
], AboutPage.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: "datetime" }),
    __metadata("design:type", Date)
], AboutPage.prototype, "updatedAt", void 0);
exports.AboutPage = AboutPage = __decorate([
    (0, typeorm_1.Entity)({ name: "about_page" })
], AboutPage);
