import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductTranslation1753333928239 implements MigrationInterface {
    name = 'AddProductTranslation1753333928239'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_translation" ("id" int NOT NULL IDENTITY(1,1), "language" nvarchar(255) NOT NULL, "title" nvarchar(255) NOT NULL, "description" nvarchar(255), "productId" int, CONSTRAINT "PK_62d00fbc92e7a495701d6fee9d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_translation" ADD CONSTRAINT "FK_77562fa6f960ba7268ff8e306f3" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_translation" DROP CONSTRAINT "FK_77562fa6f960ba7268ff8e306f3"`);
        await queryRunner.query(`DROP TABLE "product_translation"`);
    }

}
