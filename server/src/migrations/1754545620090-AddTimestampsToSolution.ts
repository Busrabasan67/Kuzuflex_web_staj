import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimestampsToSolution1754545620090 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "solution" ADD "createdAt" datetime NOT NULL CONSTRAINT "DF_solution_createdAt" DEFAULT GETDATE()`);
        await queryRunner.query(`ALTER TABLE "solution" ADD "updatedAt" datetime NOT NULL CONSTRAINT "DF_solution_updatedAt" DEFAULT GETDATE()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "solution" DROP CONSTRAINT "DF_solution_updatedAt"`);
        await queryRunner.query(`ALTER TABLE "solution" DROP CONSTRAINT "DF_solution_createdAt"`);
        await queryRunner.query(`ALTER TABLE "solution" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "solution" DROP COLUMN "createdAt"`);
    }

}
