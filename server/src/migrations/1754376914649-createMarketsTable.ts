import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMarketsTable1754376914649 implements MigrationInterface {
    name = 'CreateMarketsTable1754376914649'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "market_translation" ("id" int NOT NULL IDENTITY(1,1), "language" nvarchar(255) NOT NULL, "name" nvarchar(255) NOT NULL, "description" nvarchar(MAX), "marketId" int, CONSTRAINT "PK_e9f4525c1951394e17e6803e676" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "market_content" ("id" int NOT NULL IDENTITY(1,1), "type" nvarchar(255) NOT NULL, "level" nvarchar(255) NOT NULL, "name" nvarchar(255), "targetUrl" nvarchar(255), "productGroupId" int, "productId" int, "order" int NOT NULL CONSTRAINT "DF_1ab9998f08702ab79f3b9b51cc4" DEFAULT 0, "marketId" int, CONSTRAINT "PK_65959e896d8453fc6bfeb1ca89f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "market" ("id" int NOT NULL IDENTITY(1,1), "slug" nvarchar(255) NOT NULL, "imageUrl" nvarchar(255), "order" int NOT NULL CONSTRAINT "DF_70ff630d93d1aca6910ec36be71" DEFAULT 0, "isActive" bit NOT NULL CONSTRAINT "DF_a8b91673d8f67310cea3ba5a756" DEFAULT 1, "hasProducts" bit NOT NULL CONSTRAINT "DF_eb07b72e74420c58a6ffe2082c0" DEFAULT 0, "hasSolutions" bit NOT NULL CONSTRAINT "DF_ecff54e53831f5dbcced7a7a87e" DEFAULT 0, "hasCertificates" bit NOT NULL CONSTRAINT "DF_a4264359c917f6b5991d7b149f7" DEFAULT 0, CONSTRAINT "UQ_8da3ef9dd1792adf756abc6c1a3" UNIQUE ("slug"), CONSTRAINT "PK_1e9a2963edfd331d92018e3abac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "solution" ADD "marketId" int`);
        await queryRunner.query(`ALTER TABLE "product_group" ADD "marketId" int`);
        await queryRunner.query(`ALTER TABLE "market_translation" ADD CONSTRAINT "FK_76de96bee74857c6b7d765131de" FOREIGN KEY ("marketId") REFERENCES "market"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "solution" ADD CONSTRAINT "FK_d90ead83c60b1545811b7d1c14a" FOREIGN KEY ("marketId") REFERENCES "market"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "market_content" ADD CONSTRAINT "FK_8e0a3be1358e2289776f4e75cb8" FOREIGN KEY ("marketId") REFERENCES "market"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_group" ADD CONSTRAINT "FK_92b05b8f271dea3e6da59692bfb" FOREIGN KEY ("marketId") REFERENCES "market"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_group" DROP CONSTRAINT "FK_92b05b8f271dea3e6da59692bfb"`);
        await queryRunner.query(`ALTER TABLE "market_content" DROP CONSTRAINT "FK_8e0a3be1358e2289776f4e75cb8"`);
        await queryRunner.query(`ALTER TABLE "solution" DROP CONSTRAINT "FK_d90ead83c60b1545811b7d1c14a"`);
        await queryRunner.query(`ALTER TABLE "market_translation" DROP CONSTRAINT "FK_76de96bee74857c6b7d765131de"`);
        await queryRunner.query(`ALTER TABLE "product_group" DROP COLUMN "marketId"`);
        await queryRunner.query(`ALTER TABLE "solution" DROP COLUMN "marketId"`);
        await queryRunner.query(`DROP TABLE "market"`);
        await queryRunner.query(`DROP TABLE "market_content"`);
        await queryRunner.query(`DROP TABLE "market_translation"`);
    }

}
