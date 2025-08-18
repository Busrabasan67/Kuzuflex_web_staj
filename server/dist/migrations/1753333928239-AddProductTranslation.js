"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProductTranslation1753333928239 = void 0;
class AddProductTranslation1753333928239 {
    constructor() {
        this.name = 'AddProductTranslation1753333928239';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "product_translation" ("id" int NOT NULL IDENTITY(1,1), "language" nvarchar(255) NOT NULL, "title" nvarchar(255) NOT NULL, "description" nvarchar(255), "productId" int, CONSTRAINT "PK_62d00fbc92e7a495701d6fee9d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_translation" ADD CONSTRAINT "FK_77562fa6f960ba7268ff8e306f3" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product_translation" DROP CONSTRAINT "FK_77562fa6f960ba7268ff8e306f3"`);
        await queryRunner.query(`DROP TABLE "product_translation"`);
    }
}
exports.AddProductTranslation1753333928239 = AddProductTranslation1753333928239;
