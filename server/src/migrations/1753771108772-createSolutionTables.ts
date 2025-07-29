import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSolutionTables1753771108772 implements MigrationInterface {
    name = 'CreateSolutionTables1753771108772'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "solution_extra_content" ("id" int NOT NULL IDENTITY(1,1), "type" nvarchar(255) NOT NULL, "title" nvarchar(255) NOT NULL, "content" nvarchar(MAX) NOT NULL, "order" int NOT NULL, "language" nvarchar(255) NOT NULL, "solutionId" int, CONSTRAINT "PK_01d0e2402fa89afcb746747e267" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "solution_translation" ADD "subtitle" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "solution" ADD "slug" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "solution" ADD "hasExtraContent" bit NOT NULL CONSTRAINT "DF_cdb64c64e7a2e496d24c4e8df5b" DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "solution_extra_content" ADD CONSTRAINT "FK_cb416011ba900cd905a7a4e6bc4" FOREIGN KEY ("solutionId") REFERENCES "solution"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "solution_extra_content" DROP CONSTRAINT "FK_cb416011ba900cd905a7a4e6bc4"`);
        await queryRunner.query(`ALTER TABLE "solution" DROP CONSTRAINT "DF_cdb64c64e7a2e496d24c4e8df5b"`);
        await queryRunner.query(`ALTER TABLE "solution" DROP COLUMN "hasExtraContent"`);
        await queryRunner.query(`ALTER TABLE "solution" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "solution_translation" DROP COLUMN "subtitle"`);
        await queryRunner.query(`DROP TABLE "solution_extra_content"`);
    }

}
