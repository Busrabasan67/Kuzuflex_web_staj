"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixDatetimeForQMDocuments1754305965460 = void 0;
class FixDatetimeForQMDocuments1754305965460 {
    constructor() {
        this.name = 'FixDatetimeForQMDocuments1754305965460';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "qm_documents_and_certificates_translations" ("id" int NOT NULL IDENTITY(1,1), "language" nvarchar(10) NOT NULL, "title" nvarchar(255), "description" text, "documentId" int, CONSTRAINT "PK_349662379144f829d0091698739" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "qm_documents_and_certificates" ("id" int NOT NULL IDENTITY(1,1), "slug" nvarchar(255), "imageUrl" nvarchar(255), "pdfUrl" nvarchar(255), "type" nvarchar(255) NOT NULL CONSTRAINT "DF_3085642c8d0ede2f53b62887dbb" DEFAULT 'document', "isInternational" bit NOT NULL CONSTRAINT "DF_3f32819124465bce6c14cb649c7" DEFAULT 0, "createdAt" datetime NOT NULL CONSTRAINT "DF_dc8a5f694004d711b8588f8f302" DEFAULT GETDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_752866b4879348fe24be66f758d" DEFAULT GETDATE(), CONSTRAINT "PK_e5ed7c615e0823adb07aaf5b297" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates_translations" ADD CONSTRAINT "FK_d538891e8df0895cfd201448579" FOREIGN KEY ("documentId") REFERENCES "qm_documents_and_certificates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "qm_documents_and_certificates_translations" DROP CONSTRAINT "FK_d538891e8df0895cfd201448579"`);
        await queryRunner.query(`DROP TABLE "qm_documents_and_certificates"`);
        await queryRunner.query(`DROP TABLE "qm_documents_and_certificates_translations"`);
    }
}
exports.FixDatetimeForQMDocuments1754305965460 = FixDatetimeForQMDocuments1754305965460;
