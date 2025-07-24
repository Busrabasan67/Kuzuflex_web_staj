"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveCategoryTable1699999999999 = void 0;
class RemoveCategoryTable1699999999999 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE catalog DROP CONSTRAINT FK_f52664d1c1d3aa75d31e233cb47`);
        await queryRunner.query(`ALTER TABLE product DROP CONSTRAINT FK_ff0c0301a95e517153df97f6812`);
        await queryRunner.query(`DROP TABLE IF EXISTS category`);
        await queryRunner.query(`DROP TABLE IF EXISTS product_group`);
    }
    async down(queryRunner) {
        // Geri almak istersen eski yapıya uygun tekrar oluştur
        await queryRunner.query(`
      CREATE TABLE category (
        id INT PRIMARY KEY IDENTITY(1,1),
        name VARCHAR(255) NOT NULL
      )
    `);
    }
}
exports.RemoveCategoryTable1699999999999 = RemoveCategoryTable1699999999999;
