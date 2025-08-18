"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialSetup1753294781356 = void 0;
class InitialSetup1753294781356 {
    constructor() {
        this.name = 'InitialSetup1753294781356';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "product_group" ("id" int NOT NULL IDENTITY(1,1), "name" nvarchar(255) NOT NULL, "description" nvarchar(255), "imageUrl" nvarchar(255), "standard" nvarchar(255), CONSTRAINT "PK_8c03e90007cd9645242e594a041" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "catalog" ("id" int NOT NULL IDENTITY(1,1), "name" nvarchar(255) NOT NULL, "fileUrl" nvarchar(255) NOT NULL, "productId" int, CONSTRAINT "PK_782754bded12b4e75ad4afff913" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("id" int NOT NULL IDENTITY(1,1), "title" nvarchar(255) NOT NULL, "description" nvarchar(255), "imageUrl" nvarchar(255), "standard" nvarchar(255), "groupId" int, "parentId" int, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admin" ("id" int NOT NULL IDENTITY(1,1), "username" nvarchar(255) NOT NULL, "passwordHash" nvarchar(255) NOT NULL, "email" nvarchar(255) NOT NULL, CONSTRAINT "UQ_5e568e001f9d1b91f67815c580f" UNIQUE ("username"), CONSTRAINT "UQ_439e9fc4047ab2e55313fac1d21" UNIQUE ("passwordHash"), CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "catalog" ADD CONSTRAINT "FK_f52664d1c1d3aa75d31e233cb47" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_9ff07d9b0075484eb946e79e567" FOREIGN KEY ("groupId") REFERENCES "product_group"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_77e467b32f0a8b7a1e5503eecac" FOREIGN KEY ("parentId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_77e467b32f0a8b7a1e5503eecac"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_9ff07d9b0075484eb946e79e567"`);
        await queryRunner.query(`ALTER TABLE "catalog" DROP CONSTRAINT "FK_f52664d1c1d3aa75d31e233cb47"`);
        await queryRunner.query(`DROP TABLE "admin"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "catalog"`);
        await queryRunner.query(`DROP TABLE "product_group"`);
    }
}
exports.InitialSetup1753294781356 = InitialSetup1753294781356;
