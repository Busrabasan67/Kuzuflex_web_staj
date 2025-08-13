import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveGermanyEmail1755093666111 implements MigrationInterface {
    name = 'RemoveGermanyEmail1755093666111'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_settings" DROP CONSTRAINT "DF_c30fceb62499aa0768147b0f861"`);
        await queryRunner.query(`ALTER TABLE "email_settings" DROP COLUMN "germanyEmail"`);
        await queryRunner.query(`ALTER TABLE "email_settings" DROP CONSTRAINT "DF_d2167a30b5c660dd5758e5d57e1"`);
        await queryRunner.query(`ALTER TABLE "email_settings" DROP COLUMN "mailFrom"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_settings" ADD "mailFrom" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "email_settings" ADD CONSTRAINT "DF_d2167a30b5c660dd5758e5d57e1" DEFAULT 'wifi@kuzuflex.com' FOR "mailFrom"`);
        await queryRunner.query(`ALTER TABLE "email_settings" ADD "germanyEmail" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "email_settings" ADD CONSTRAINT "DF_c30fceb62499aa0768147b0f861" DEFAULT 'bilgiislem@kuzuflex.com' FOR "germanyEmail"`);
    }

}
