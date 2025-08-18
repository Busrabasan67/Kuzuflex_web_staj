"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePasswordResetToken1755245140368 = void 0;
class CreatePasswordResetToken1755245140368 {
    constructor() {
        this.name = 'CreatePasswordResetToken1755245140368';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "password_reset_token" ("id" int NOT NULL IDENTITY(1,1), "token" nvarchar(255) NOT NULL, "email" nvarchar(255) NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_ac516108dad4d4797f14a841442" DEFAULT getdate(), "expiresAt" datetime NOT NULL, "used" bit NOT NULL CONSTRAINT "DF_5a7066bc0a5bcf4b1f3b906f6e1" DEFAULT 0, "adminId" int, CONSTRAINT "PK_838af121380dfe3a6330e04f5bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "password_reset_token" ADD CONSTRAINT "FK_96a586ec1f8732250084451fd34" FOREIGN KEY ("adminId") REFERENCES "admin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "password_reset_token" DROP CONSTRAINT "FK_96a586ec1f8732250084451fd34"`);
        await queryRunner.query(`DROP TABLE "password_reset_token"`);
    }
}
exports.CreatePasswordResetToken1755245140368 = CreatePasswordResetToken1755245140368;
