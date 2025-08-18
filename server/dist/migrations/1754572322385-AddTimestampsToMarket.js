"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTimestampsToMarket1754572322385 = void 0;
class AddTimestampsToMarket1754572322385 {
    constructor() {
        this.name = 'AddTimestampsToMarket1754572322385';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "market" ADD "createdAt" datetime NOT NULL CONSTRAINT "DF_28f6938cfbdaf1ff3d2ae365250" DEFAULT GETDATE()`);
        await queryRunner.query(`ALTER TABLE "market" ADD "updatedAt" datetime NOT NULL CONSTRAINT "DF_05302fa1d9cb0c7dc6c46e238fa" DEFAULT GETDATE()`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "market" DROP CONSTRAINT "DF_05302fa1d9cb0c7dc6c46e238fa"`);
        await queryRunner.query(`ALTER TABLE "market" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "market" DROP CONSTRAINT "DF_28f6938cfbdaf1ff3d2ae365250"`);
        await queryRunner.query(`ALTER TABLE "market" DROP COLUMN "createdAt"`);
    }
}
exports.AddTimestampsToMarket1754572322385 = AddTimestampsToMarket1754572322385;
