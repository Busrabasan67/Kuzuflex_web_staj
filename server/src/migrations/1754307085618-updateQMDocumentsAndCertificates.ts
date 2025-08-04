import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateQMDocumentsAndCertificates1754307085618 implements MigrationInterface {
    name = 'UpdateQMDocumentsAndCertificates1754307085618'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" DROP COLUMN "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" DROP COLUMN "pdfUrl"`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" ADD "imageUrlTr" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" ADD "imageUrlEn" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" ADD "pdfUrlTr" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" ADD "pdfUrlEn" nvarchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" DROP COLUMN "pdfUrlEn"`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" DROP COLUMN "pdfUrlTr"`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" DROP COLUMN "imageUrlEn"`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" DROP COLUMN "imageUrlTr"`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" ADD "pdfUrl" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" ADD "imageUrl" nvarchar(255)`);
    }

}
