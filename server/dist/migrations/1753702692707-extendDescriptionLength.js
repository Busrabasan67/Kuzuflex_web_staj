"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendDescriptionLength1753702692707 = void 0;
class ExtendDescriptionLength1753702692707 {
    constructor() {
        this.name = 'ExtendDescriptionLength1753702692707';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "solution_translation" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "solution_translation" ADD "description" nvarchar(MAX) NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "solution_translation" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "solution_translation" ADD "description" nvarchar(255) NOT NULL`);
    }
}
exports.ExtendDescriptionLength1753702692707 = ExtendDescriptionLength1753702692707;
