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
exports.Solution = void 0;
const typeorm_1 = require("typeorm");
const SolutionTranslation_1 = require("./SolutionTranslation");
const SolutionExtraContent_1 = require("./SolutionExtraContent");
const Market_1 = require("./Market");
let Solution = class Solution {
};
exports.Solution = Solution;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Solution.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Solution.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Solution.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Solution.prototype, "hasExtraContent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => SolutionTranslation_1.SolutionTranslation, t => t.solution, { cascade: true }),
    __metadata("design:type", Array)
], Solution.prototype, "translations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => SolutionExtraContent_1.SolutionExtraContent, e => e.solution, { cascade: true }),
    __metadata("design:type", Array)
], Solution.prototype, "extraContents", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Market_1.Market, (market) => market.solutions, { nullable: true }),
    __metadata("design:type", Market_1.Market)
], Solution.prototype, "market", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "datetime" }),
    __metadata("design:type", Date)
], Solution.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: "datetime" }),
    __metadata("design:type", Date)
], Solution.prototype, "updatedAt", void 0);
exports.Solution = Solution = __decorate([
    (0, typeorm_1.Entity)()
], Solution);
