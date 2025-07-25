import { MigrationInterface, QueryRunner } from "typeorm";

export class FixFileUrlNotNullProperly1753437976806 implements MigrationInterface {
    name = 'FixFileUrlNotNullProperly1753437976806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "catalog_translation" DROP COLUMN "filePath"`);
        await queryRunner.query(`ALTER TABLE "catalog_translation" ADD "filePath" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "catalog_translation" DROP COLUMN "fileUrl"`);
        await queryRunner.query(`ALTER TABLE "catalog_translation" ADD "fileUrl" varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "catalog_translation" DROP COLUMN "fileUrl"`);
        await queryRunner.query(`ALTER TABLE "catalog_translation" ADD "fileUrl" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "catalog_translation" DROP COLUMN "filePath"`);
        await queryRunner.query(`ALTER TABLE "catalog_translation" ADD "filePath" nvarchar(255) NOT NULL`);
    }

}
