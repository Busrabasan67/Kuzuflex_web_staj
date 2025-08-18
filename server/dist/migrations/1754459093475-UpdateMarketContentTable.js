"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMarketContentTable1754459093475 = void 0;
class UpdateMarketContentTable1754459093475 {
    constructor() {
        this.name = 'UpdateMarketContentTable1754459093475';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "market_content" DROP COLUMN "level"`);
        await queryRunner.query(`ALTER TABLE "market_content" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "market_content" ADD "solutionId" int`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "market_content" DROP COLUMN "solutionId"`);
        await queryRunner.query(`ALTER TABLE "market_content" ADD "name" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "market_content" ADD "level" nvarchar(255) NOT NULL`);
    }
}
exports.UpdateMarketContentTable1754459093475 = UpdateMarketContentTable1754459093475;
