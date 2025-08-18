"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDescriptionLength1753346335706 = void 0;
class UpdateDescriptionLength1753346335706 {
    constructor() {
        this.name = 'UpdateDescriptionLength1753346335706';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product_translation" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "product_translation" ADD "description" varchar(MAX) NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product_translation" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "product_translation" ADD "description" nvarchar(255) NOT NULL`);
    }
}
exports.UpdateDescriptionLength1753346335706 = UpdateDescriptionLength1753346335706;
