"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProductGroupAndUpdates1753268642152 = void 0;
class AddProductGroupAndUpdates1753268642152 {
    constructor() {
        this.name = 'AddProductGroupAndUpdates1753268642152';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "product_group" ("id" int NOT NULL IDENTITY(1,1), "name" nvarchar(255) NOT NULL, "description" nvarchar(255), "imageUrl" nvarchar(255), "standard" nvarchar(255), CONSTRAINT "PK_8c03e90007cd9645242e594a041" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "images"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "standards"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "catalog" ADD "name" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ADD "title" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ADD "imageUrl" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "product" ADD "standard" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "product" ADD "groupId" int`);
        await queryRunner.query(`ALTER TABLE "product" ADD "parentId" int`);
        await queryRunner.query(`ALTER TABLE "catalog" ADD CONSTRAINT "FK_f52664d1c1d3aa75d31e233cb47" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_9ff07d9b0075484eb946e79e567" FOREIGN KEY ("groupId") REFERENCES "product_group"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_77e467b32f0a8b7a1e5503eecac" FOREIGN KEY ("parentId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_77e467b32f0a8b7a1e5503eecac"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_9ff07d9b0075484eb946e79e567"`);
        await queryRunner.query(`ALTER TABLE "catalog" DROP CONSTRAINT "FK_f52664d1c1d3aa75d31e233cb47"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "parentId"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "groupId"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "standard"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "catalog" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "categoryId" int`);
        await queryRunner.query(`ALTER TABLE "product" ADD "standards" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "product" ADD "images" ntext`);
        await queryRunner.query(`ALTER TABLE "product" ADD "name" nvarchar(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE "product_group"`);
    }
}
exports.AddProductGroupAndUpdates1753268642152 = AddProductGroupAndUpdates1753268642152;
