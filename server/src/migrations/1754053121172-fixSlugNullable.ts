import { MigrationInterface, QueryRunner } from "typeorm";

export class FixSlugNullable1754053121172 implements MigrationInterface {
    name = 'FixSlugNullable1754053121172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_group" ADD "slug" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "product" ADD "slug" nvarchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "product_group" DROP COLUMN "slug"`);
    }

}
