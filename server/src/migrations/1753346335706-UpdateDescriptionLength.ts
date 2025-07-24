import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDescriptionLength1753346335706 implements MigrationInterface {
    name = 'UpdateDescriptionLength1753346335706'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_translation" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "product_translation" ADD "description" varchar(MAX) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_translation" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "product_translation" ADD "description" nvarchar(255) NOT NULL`);
    }

}
