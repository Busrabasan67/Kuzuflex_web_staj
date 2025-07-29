import { MigrationInterface, QueryRunner } from "typeorm";

export class FinalSolutions1753702216435 implements MigrationInterface {
    name = 'FinalSolutions1753702216435'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "solution_translation" ("id" int NOT NULL IDENTITY(1,1), "language" nvarchar(255) NOT NULL, "title" nvarchar(255) NOT NULL, "description" nvarchar(255) NOT NULL, "solutionId" int, CONSTRAINT "PK_c8d0c2f24d4241182d9f5465e91" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "solution" ("id" int NOT NULL IDENTITY(1,1), "imageUrl" nvarchar(255) NOT NULL, CONSTRAINT "PK_73fc40b114205776818a2f2f248" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "solution_translation" ADD CONSTRAINT "FK_eb3f04c93f6f69375333e19754e" FOREIGN KEY ("solutionId") REFERENCES "solution"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "solution_translation" DROP CONSTRAINT "FK_eb3f04c93f6f69375333e19754e"`);
        await queryRunner.query(`DROP TABLE "solution"`);
        await queryRunner.query(`DROP TABLE "solution_translation"`);
    }

}
