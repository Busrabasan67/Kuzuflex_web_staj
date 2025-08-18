import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveDescriptionFromQmDocuments1755521741409 implements MigrationInterface {
    name = 'RemoveDescriptionFromQmDocuments1755521741409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates_translations" DROP COLUMN "description"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates_translations" ADD "description" text`);
    }

}
