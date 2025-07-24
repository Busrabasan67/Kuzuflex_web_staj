"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAdmin1753184808316 = void 0;
class CreateAdmin1753184808316 {
    constructor() {
        this.name = 'CreateAdmin1753184808316';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "admin" ("id" int NOT NULL IDENTITY(1,1), "username" nvarchar(255) NOT NULL, "passwordHash" nvarchar(255) NOT NULL, "emailHash" nvarchar(255) NOT NULL, CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "admin"`);
    }
}
exports.CreateAdmin1753184808316 = CreateAdmin1753184808316;
