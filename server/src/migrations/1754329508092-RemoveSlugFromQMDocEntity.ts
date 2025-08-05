import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveSlugFromQMDocEntity1754329508092 implements MigrationInterface {
    name = 'RemoveSlugFromQMDocEntity1754329508092'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" DROP COLUMN "slug"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" ADD "slug" nvarchar(255)`);
    }

}
