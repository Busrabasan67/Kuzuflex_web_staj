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
exports.QMDocumentsAndCertificates = void 0;
const typeorm_1 = require("typeorm");
const QMDocumentsAndCertificatesTranslation_1 = require("./QMDocumentsAndCertificatesTranslation");
let QMDocumentsAndCertificates = class QMDocumentsAndCertificates {
};
exports.QMDocumentsAndCertificates = QMDocumentsAndCertificates;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], QMDocumentsAndCertificates.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], QMDocumentsAndCertificates.prototype, "imageUrlTr", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], QMDocumentsAndCertificates.prototype, "imageUrlEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], QMDocumentsAndCertificates.prototype, "pdfUrlTr", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], QMDocumentsAndCertificates.prototype, "pdfUrlEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', default: 'document' }) // 🔧 enum yerine string
    ,
    __metadata("design:type", String)
], QMDocumentsAndCertificates.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: false }),
    __metadata("design:type", Boolean)
], QMDocumentsAndCertificates.prototype, "isInternational", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'GETDATE()' }),
    __metadata("design:type", Date)
], QMDocumentsAndCertificates.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'GETDATE()', onUpdate: 'GETDATE()' }),
    __metadata("design:type", Date)
], QMDocumentsAndCertificates.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => QMDocumentsAndCertificatesTranslation_1.QMDocumentsAndCertificatesTranslations, translation => translation.document, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], QMDocumentsAndCertificates.prototype, "translations", void 0);
exports.QMDocumentsAndCertificates = QMDocumentsAndCertificates = __decorate([
    (0, typeorm_1.Entity)()
], QMDocumentsAndCertificates);
