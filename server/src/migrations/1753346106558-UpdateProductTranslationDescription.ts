import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProductTranslationDescription1753346106558 implements MigrationInterface {
    name = 'UpdateProductTranslationDescription1753346106558'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_translation" ALTER COLUMN "description" nvarchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_translation" ALTER COLUMN "description" nvarchar(255)`);
    }

}
