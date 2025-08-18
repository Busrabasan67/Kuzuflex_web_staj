"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProductGroupTranslation1753334096594 = void 0;
class AddProductGroupTranslation1753334096594 {
    constructor() {
        this.name = 'AddProductGroupTranslation1753334096594';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "product_group_translation" ("id" int NOT NULL IDENTITY(1,1), "language" nvarchar(255) NOT NULL, "name" nvarchar(255) NOT NULL, "description" nvarchar(255), "groupId" int, CONSTRAINT "PK_2d9edd2d20a337912d61f779aad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_group_translation" ADD CONSTRAINT "FK_725bd8d9515cf73aeee70448697" FOREIGN KEY ("groupId") REFERENCES "product_group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "product_group_translation" DROP CONSTRAINT "FK_725bd8d9515cf73aeee70448697"`);
        await queryRunner.query(`DROP TABLE "product_group_translation"`);
    }
}
exports.AddProductGroupTranslation1753334096594 = AddProductGroupTranslation1753334096594;
