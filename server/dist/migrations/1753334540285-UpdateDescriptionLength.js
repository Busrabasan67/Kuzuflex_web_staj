"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDescriptionLength1753334540285 = void 0;
class UpdateDescriptionLength1753334540285 {
    constructor() {
        this.name = 'UpdateDescriptionLength1753334540285';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product_group" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "product_group" ADD "description" nvarchar(1000)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product_group" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "product_group" ADD "description" nvarchar(255)`);
    }
}
exports.UpdateDescriptionLength1753334540285 = UpdateDescriptionLength1753334540285;
