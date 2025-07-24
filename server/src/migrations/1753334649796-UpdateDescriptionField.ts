import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDescriptionField1753334649796 implements MigrationInterface {
    name = 'UpdateDescriptionField1753334649796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_group" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "product_group" ADD "description" nvarchar(MAX)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_group" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "product_group" ADD "description" nvarchar(1000)`);
    }

}
