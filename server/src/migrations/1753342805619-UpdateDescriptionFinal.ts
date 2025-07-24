import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDescriptionFinal1753342805619 implements MigrationInterface {
    name = 'UpdateDescriptionFinal1753342805619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_group_translation" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "product_group_translation" ADD "description" nvarchar(MAX) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_group_translation" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "product_group_translation" ADD "description" nvarchar(255)`);
    }

}
