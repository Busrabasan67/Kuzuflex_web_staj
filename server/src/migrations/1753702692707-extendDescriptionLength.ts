import { MigrationInterface, QueryRunner } from "typeorm";

export class ExtendDescriptionLength1753702692707 implements MigrationInterface {
    name = 'ExtendDescriptionLength1753702692707'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "solution_translation" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "solution_translation" ADD "description" nvarchar(MAX) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "solution_translation" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "solution_translation" ADD "description" nvarchar(255) NOT NULL`);
    }

}
