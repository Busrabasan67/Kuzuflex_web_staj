"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveSlugFromQMDocEntity1754329508092 = void 0;
class RemoveSlugFromQMDocEntity1754329508092 {
    constructor() {
        this.name = 'RemoveSlugFromQMDocEntity1754329508092';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" DROP COLUMN "slug"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates" ADD "slug" nvarchar(255)`);
    }
}
exports.RemoveSlugFromQMDocEntity1754329508092 = RemoveSlugFromQMDocEntity1754329508092;
