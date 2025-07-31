import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveNameDescriptionFromProductGroup1753948909229 implements MigrationInterface {
    name = 'RemoveNameDescriptionFromProductGroup1753948909229'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_group" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "product_group" DROP COLUMN "description"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_group" ADD "description" nvarchar(MAX)`);
        await queryRunner.query(`ALTER TABLE "product_group" ADD "name" nvarchar(255) NOT NULL`);
    }

}
