"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateQMDocumentsAndCertificates1754307085618 = void 0;
class UpdateQMDocumentsAndCertificates1754307085618 {
    constructor() {
        this.name = 'UpdateQMDocumentsAndCertificates1754307085618';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" DROP COLUMN "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" DROP COLUMN "pdfUrl"`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" ADD "imageUrlTr" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" ADD "imageUrlEn" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" ADD "pdfUrlTr" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" ADD "pdfUrlEn" nvarchar(255)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" DROP COLUMN "pdfUrlEn"`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" DROP COLUMN "pdfUrlTr"`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" DROP COLUMN "imageUrlEn"`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" DROP COLUMN "imageUrlTr"`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" ADD "pdfUrl" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" ADD "imageUrl" nvarchar(255)`);
    }
}
exports.UpdateQMDocumentsAndCertificates1754307085618 = UpdateQMDocumentsAndCertificates1754307085618;
