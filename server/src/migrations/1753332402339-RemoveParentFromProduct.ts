import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveParentFromProduct1753332402339 implements MigrationInterface {
    name = 'RemoveParentFromProduct1753332402339'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_77e467b32f0a8b7a1e5503eecac"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "parentId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "parentId" int`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_77e467b32f0a8b7a1e5503eecac" FOREIGN KEY ("parentId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
