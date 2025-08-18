"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductTranslationDescription1753346106558 = void 0;
class UpdateProductTranslationDescription1753346106558 {
    constructor() {
        this.name = 'UpdateProductTranslationDescription1753346106558';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product_translation" ALTER COLUMN "description" nvarchar(255) NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product_translation" ALTER COLUMN "description" nvarchar(255)`);
    }
}
exports.UpdateProductTranslationDescription1753346106558 = UpdateProductTranslationDescription1753346106558;
