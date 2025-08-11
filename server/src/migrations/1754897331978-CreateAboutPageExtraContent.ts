import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAboutPageExtraContent1754897331978 implements MigrationInterface {
    name = 'CreateAboutPageExtraContent1754897331978'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "about_page_extra_content" ("id" int NOT NULL IDENTITY(1,1), "language" nvarchar(5) NOT NULL, "title" nvarchar(255) NOT NULL, "content" nvarchar(MAX) NOT NULL, "type" nvarchar(255) NOT NULL, "order" int NOT NULL, "createdAt" datetime NOT NULL CONSTRAINT "DF_dd49b681387f729a1a85dc6833f" DEFAULT getdate(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_519c6d528fe71609a8fbcc44954" DEFAULT getdate(), "pageId" int, CONSTRAINT "PK_b300008ffbbec91dcebc2422188" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_25c62d1032af6a619b8b339285" ON "about_page_extra_content" ("language") `);
        await queryRunner.query(`ALTER TABLE "about_page_extra_content" ADD CONSTRAINT "FK_415bafa17ba14a5af014332f4f8" FOREIGN KEY ("pageId") REFERENCES "about_page"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "about_page_extra_content" DROP CONSTRAINT "FK_415bafa17ba14a5af014332f4f8"`);
        await queryRunner.query(`DROP INDEX "IDX_25c62d1032af6a619b8b339285" ON "about_page_extra_content"`);
        await queryRunner.query(`DROP TABLE "about_page_extra_content"`);
    }

}
