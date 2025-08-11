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
exports.AboutPageExtraContent = void 0;
const typeorm_1 = require("typeorm");
const AboutPage_1 = require("./AboutPage");
let AboutPageExtraContent = class AboutPageExtraContent {
};
exports.AboutPageExtraContent = AboutPageExtraContent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AboutPageExtraContent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ length: 5 }),
    __metadata("design:type", String)
], AboutPageExtraContent.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AboutPageExtraContent.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)("nvarchar", { length: "MAX" }),
    __metadata("design:type", String)
], AboutPageExtraContent.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AboutPageExtraContent.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], AboutPageExtraContent.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => AboutPage_1.AboutPage, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "pageId" }),
    __metadata("design:type", AboutPage_1.AboutPage)
], AboutPageExtraContent.prototype, "page", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "datetime" }),
    __metadata("design:type", Date)
], AboutPageExtraContent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: "datetime" }),
    __metadata("design:type", Date)
], AboutPageExtraContent.prototype, "updatedAt", void 0);
exports.AboutPageExtraContent = AboutPageExtraContent = __decorate([
    (0, typeorm_1.Entity)({ name: "about_page_extra_content" })
], AboutPageExtraContent);
