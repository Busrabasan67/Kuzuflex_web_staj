"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveParentFromProduct1753332402339 = void 0;
class RemoveParentFromProduct1753332402339 {
    constructor() {
        this.name = 'RemoveParentFromProduct1753332402339';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_77e467b32f0a8b7a1e5503eecac"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "parentId"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product" ADD "parentId" int`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_77e467b32f0a8b7a1e5503eecac" FOREIGN KEY ("parentId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
exports.RemoveParentFromProduct1753332402339 = RemoveParentFromProduct1753332402339;
