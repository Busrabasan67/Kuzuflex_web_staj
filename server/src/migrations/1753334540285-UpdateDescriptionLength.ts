import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDescriptionLength1753334540285 implements MigrationInterface {
    name = 'UpdateDescriptionLength1753334540285'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_group" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "product_group" ADD "description" nvarchar(1000)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_group" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "product_group" ADD "description" nvarchar(255)`);
    }

}
