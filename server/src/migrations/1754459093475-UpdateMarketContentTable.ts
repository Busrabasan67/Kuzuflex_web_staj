import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMarketContentTable1754459093475 implements MigrationInterface {
    name = 'UpdateMarketContentTable1754459093475'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "market_content" DROP COLUMN "level"`);
        await queryRunner.query(`ALTER TABLE "market_content" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "market_content" ADD "solutionId" int`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "market_content" DROP COLUMN "solutionId"`);
        await queryRunner.query(`ALTER TABLE "market_content" ADD "name" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "market_content" ADD "level" nvarchar(255) NOT NULL`);
    }

}
