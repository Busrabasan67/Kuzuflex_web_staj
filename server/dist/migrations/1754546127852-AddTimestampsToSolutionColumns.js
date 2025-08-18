"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTimestampsToSolutionColumns1754546127852 = void 0;
class AddTimestampsToSolutionColumns1754546127852 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "solution" ADD "createdAt" datetime NOT NULL CONSTRAINT "DF_solution_createdAt" DEFAULT GETDATE()`);
        await queryRunner.query(`ALTER TABLE "solution" ADD "updatedAt" datetime NOT NULL CONSTRAINT "DF_solution_updatedAt" DEFAULT GETDATE()`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "solution" DROP CONSTRAINT "DF_solution_updatedAt"`);
        await queryRunner.query(`ALTER TABLE "solution" DROP CONSTRAINT "DF_solution_createdAt"`);
        await queryRunner.query(`ALTER TABLE "solution" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "solution" DROP COLUMN "createdAt"`);
    }
}
exports.AddTimestampsToSolutionColumns1754546127852 = AddTimestampsToSolutionColumns1754546127852;
