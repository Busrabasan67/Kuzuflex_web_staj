import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveTitleAndDescriptionFromProduct1753452875760 implements MigrationInterface {
    name = 'RemoveTitleAndDescriptionFromProduct1753452875760'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "description"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "description" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "product" ADD "title" nvarchar(255) NOT NULL`);
    }

}
