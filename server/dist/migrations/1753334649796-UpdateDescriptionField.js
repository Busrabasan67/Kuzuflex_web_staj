"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDescriptionField1753334649796 = void 0;
class UpdateDescriptionField1753334649796 {
    constructor() {
        this.name = 'UpdateDescriptionField1753334649796';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product_group" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "product_group" ADD "description" nvarchar(MAX)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product_group" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "product_group" ADD "description" nvarchar(1000)`);
    }
}
exports.UpdateDescriptionField1753334649796 = UpdateDescriptionField1753334649796;
