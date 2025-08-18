"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixSlugNullable1754053121172 = void 0;
class FixSlugNullable1754053121172 {
    constructor() {
        this.name = 'FixSlugNullable1754053121172';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product_group" ADD "slug" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "product" ADD "slug" nvarchar(255)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "product_group" DROP COLUMN "slug"`);
    }
}
exports.FixSlugNullable1754053121172 = FixSlugNullable1754053121172;
