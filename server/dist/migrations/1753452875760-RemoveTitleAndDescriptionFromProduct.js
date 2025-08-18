"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveTitleAndDescriptionFromProduct1753452875760 = void 0;
class RemoveTitleAndDescriptionFromProduct1753452875760 {
    constructor() {
        this.name = 'RemoveTitleAndDescriptionFromProduct1753452875760';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "description"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product" ADD "description" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "product" ADD "title" nvarchar(255) NOT NULL`);
    }
}
exports.RemoveTitleAndDescriptionFromProduct1753452875760 = RemoveTitleAndDescriptionFromProduct1753452875760;
