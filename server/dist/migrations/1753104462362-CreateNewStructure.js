"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNewStructure1753104462362 = void 0;
class CreateNewStructure1753104462362 {
    constructor() {
        this.name = 'CreateNewStructure1753104462362';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "catalog" DROP CONSTRAINT "FK_f52664d1c1d3aa75d31e233cb47"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_5a0c91560b6cb1641b516084a97"`);
        await queryRunner.query(`EXEC sp_rename "KuzuflexDB.dbo.product.modelId", "categoryId"`);
        await queryRunner.query(`CREATE TABLE "category" ("id" int NOT NULL IDENTITY(1,1), "name" nvarchar(255) NOT NULL, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "catalog" ADD CONSTRAINT "FK_f52664d1c1d3aa75d31e233cb47" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_ff0c0301a95e517153df97f6812" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_ff0c0301a95e517153df97f6812"`);
        await queryRunner.query(`ALTER TABLE "catalog" DROP CONSTRAINT "FK_f52664d1c1d3aa75d31e233cb47"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`EXEC sp_rename "KuzuflexDB.dbo.product.categoryId", "modelId"`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_5a0c91560b6cb1641b516084a97" FOREIGN KEY ("modelId") REFERENCES "product_model"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "catalog" ADD CONSTRAINT "FK_f52664d1c1d3aa75d31e233cb47" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
exports.CreateNewStructure1753104462362 = CreateNewStructure1753104462362;
