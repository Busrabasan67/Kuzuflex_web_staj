"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDescriptionFinal1753342805619 = void 0;
class UpdateDescriptionFinal1753342805619 {
    constructor() {
        this.name = 'UpdateDescriptionFinal1753342805619';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product_group_translation" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "product_group_translation" ADD "description" nvarchar(MAX) NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product_group_translation" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "product_group_translation" ADD "description" nvarchar(255)`);
    }
}
exports.UpdateDescriptionFinal1753342805619 = UpdateDescriptionFinal1753342805619;
