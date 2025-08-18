"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAboutUsPage1754889829717 = void 0;
class CreateAboutUsPage1754889829717 {
    constructor() {
        this.name = 'CreateAboutUsPage1754889829717';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "about_page_translation" ("id" int NOT NULL IDENTITY(1,1), "language" nvarchar(5) NOT NULL, "title" nvarchar(255) NOT NULL, "subtitle" nvarchar(255), "bodyHtml" nvarchar(MAX) NOT NULL, "createdAt" datetime NOT NULL CONSTRAINT "DF_236df605744bd8a6658be3b58ee" DEFAULT getdate(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_bebae2a5da8e7b041311ae7c63d" DEFAULT getdate(), "pageId" int, CONSTRAINT "UQ_cb90a6b9daf2ab76e44fa238bee" UNIQUE ("pageId", "language"), CONSTRAINT "PK_2a909e2d22309bdd1ae7fdb1455" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e8ae3de3fbddb14b26e89fa93e" ON "about_page_translation" ("language") `);
        await queryRunner.query(`CREATE TABLE "about_page" ("id" int NOT NULL IDENTITY(1,1), "slug" nvarchar(255) NOT NULL, "heroImageUrl" nvarchar(255), "createdAt" datetime NOT NULL CONSTRAINT "DF_020292f2a3b4b747ad684f0a6b7" DEFAULT getdate(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_b021fb94d385ee82da102a974c4" DEFAULT getdate(), CONSTRAINT "PK_1dc8841661aab05254e3b99b3a2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d37527f0d3ec02921767261e2f" ON "about_page" ("slug") `);
        await queryRunner.query(`ALTER TABLE "about_page_translation" ADD CONSTRAINT "FK_d35f4624e0378d5e86ddb3b0efb" FOREIGN KEY ("pageId") REFERENCES "about_page"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "about_page_translation" DROP CONSTRAINT "FK_d35f4624e0378d5e86ddb3b0efb"`);
        await queryRunner.query(`DROP INDEX "IDX_d37527f0d3ec02921767261e2f" ON "about_page"`);
        await queryRunner.query(`DROP TABLE "about_page"`);
        await queryRunner.query(`DROP INDEX "IDX_e8ae3de3fbddb14b26e89fa93e" ON "about_page_translation"`);
        await queryRunner.query(`DROP TABLE "about_page_translation"`);
    }
}
exports.CreateAboutUsPage1754889829717 = CreateAboutUsPage1754889829717;
