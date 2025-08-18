import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveHtmlBodyAndSubtitleFromAboutPageTranslation1755504643059 implements MigrationInterface {
    name = 'RemoveHtmlBodyAndSubtitleFromAboutPageTranslation1755504643059'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "about_page_translation" DROP COLUMN "subtitle"`);
        await queryRunner.query(`ALTER TABLE "about_page_translation" DROP COLUMN "bodyHtml"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "about_page_translation" ADD "bodyHtml" nvarchar(MAX) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "about_page_translation" ADD "subtitle" nvarchar(255)`);
    }

}
