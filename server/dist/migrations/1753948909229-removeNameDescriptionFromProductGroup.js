"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveNameDescriptionFromProductGroup1753948909229 = void 0;
class RemoveNameDescriptionFromProductGroup1753948909229 {
    constructor() {
        this.name = 'RemoveNameDescriptionFromProductGroup1753948909229';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product_group" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "product_group" DROP COLUMN "description"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product_group" ADD "description" nvarchar(MAX)`);
        await queryRunner.query(`ALTER TABLE "product_group" ADD "name" nvarchar(255) NOT NULL`);
    }
}
exports.RemoveNameDescriptionFromProductGroup1753948909229 = RemoveNameDescriptionFromProductGroup1753948909229;
