import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimestampsToProductAndProductGroup1754476764127 implements MigrationInterface {
    name = 'AddTimestampsToProductAndProductGroup1754476764127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_group" ADD "createdAt" datetime NOT NULL CONSTRAINT "DF_46096be45605478dd80cc12e96a" DEFAULT GETDATE()`);
        await queryRunner.query(`ALTER TABLE "product_group" ADD "updatedAt" datetime NOT NULL CONSTRAINT "DF_a2664739f13816f86c82898ae87" DEFAULT GETDATE()`);
        await queryRunner.query(`ALTER TABLE "product" ADD "createdAt" datetime NOT NULL CONSTRAINT "DF_6b71c587b0fd3855fa23b759ca8" DEFAULT GETDATE()`);
        await queryRunner.query(`ALTER TABLE "product" ADD "updatedAt" datetime NOT NULL CONSTRAINT "DF_41bde09db7136dcee687c2b1f05" DEFAULT GETDATE()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "DF_41bde09db7136dcee687c2b1f05"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "DF_6b71c587b0fd3855fa23b759ca8"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "product_group" DROP CONSTRAINT "DF_a2664739f13816f86c82898ae87"`);
        await queryRunner.query(`ALTER TABLE "product_group" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "product_group" DROP CONSTRAINT "DF_46096be45605478dd80cc12e96a"`);
        await queryRunner.query(`ALTER TABLE "product_group" DROP COLUMN "createdAt"`);
    }

}
