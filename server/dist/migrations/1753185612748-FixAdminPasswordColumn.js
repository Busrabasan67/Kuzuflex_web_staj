"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixAdminPasswordColumn1753185612748 = void 0;
class FixAdminPasswordColumn1753185612748 {
    constructor() {
        this.name = 'FixAdminPasswordColumn1753185612748';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "emailHash"`);
        await queryRunner.query(`ALTER TABLE "admin" ADD "email" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admin" ADD CONSTRAINT "UQ_5e568e001f9d1b91f67815c580f" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "admin" ADD CONSTRAINT "UQ_439e9fc4047ab2e55313fac1d21" UNIQUE ("passwordHash")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "admin" DROP CONSTRAINT "UQ_439e9fc4047ab2e55313fac1d21"`);
        await queryRunner.query(`ALTER TABLE "admin" DROP CONSTRAINT "UQ_5e568e001f9d1b91f67815c580f"`);
        await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "admin" ADD "emailHash" nvarchar(255) NOT NULL`);
    }
}
exports.FixAdminPasswordColumn1753185612748 = FixAdminPasswordColumn1753185612748;
