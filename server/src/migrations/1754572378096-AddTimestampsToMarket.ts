import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimestampsToMarket1754572378096 implements MigrationInterface {
    name = 'AddTimestampsToMarket1754572378096'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "market" ADD "createdAt" datetime NOT NULL CONSTRAINT "DF_28f6938cfbdaf1ff3d2ae365250" DEFAULT GETDATE()`);
        await queryRunner.query(`ALTER TABLE "market" ADD "updatedAt" datetime NOT NULL CONSTRAINT "DF_05302fa1d9cb0c7dc6c46e238fa" DEFAULT GETDATE()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "market" DROP CONSTRAINT "DF_05302fa1d9cb0c7dc6c46e238fa"`);
        await queryRunner.query(`ALTER TABLE "market" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "market" DROP CONSTRAINT "DF_28f6938cfbdaf1ff3d2ae365250"`);
        await queryRunner.query(`ALTER TABLE "market" DROP COLUMN "createdAt"`);
    }

}
