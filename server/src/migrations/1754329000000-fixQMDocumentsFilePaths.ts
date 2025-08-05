import { MigrationInterface, QueryRunner } from "typeorm";

export class FixQMDocumentsFilePaths1754329000000 implements MigrationInterface {
    name = 'FixQMDocumentsFilePaths1754329000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Fix file paths for existing records by removing leading slashes
        await queryRunner.query(`
            UPDATE qm_documents_and_certificates 
            SET 
                imageUrlTr = CASE 
                    WHEN imageUrlTr IS NOT NULL AND imageUrlTr LIKE '/%' 
                    THEN SUBSTRING(imageUrlTr, 2, LEN(imageUrlTr)) 
                    ELSE imageUrlTr 
                END,
                imageUrlEn = CASE 
                    WHEN imageUrlEn IS NOT NULL AND imageUrlEn LIKE '/%' 
                    THEN SUBSTRING(imageUrlEn, 2, LEN(imageUrlEn)) 
                    ELSE imageUrlEn 
                END,
                pdfUrlTr = CASE 
                    WHEN pdfUrlTr IS NOT NULL AND pdfUrlTr LIKE '/%' 
                    THEN SUBSTRING(pdfUrlTr, 2, LEN(pdfUrlTr)) 
                    ELSE pdfUrlTr 
                END,
                pdfUrlEn = CASE 
                    WHEN pdfUrlEn IS NOT NULL AND pdfUrlEn LIKE '/%' 
                    THEN SUBSTRING(pdfUrlEn, 2, LEN(pdfUrlEn)) 
                    ELSE pdfUrlEn 
                END
            WHERE id IN (1, 2, 3, 4)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert by adding leading slashes back
        await queryRunner.query(`
            UPDATE qm_documents_and_certificates 
            SET 
                imageUrlTr = CASE 
                    WHEN imageUrlTr IS NOT NULL AND imageUrlTr NOT LIKE '/%' 
                    THEN '/' + imageUrlTr 
                    ELSE imageUrlTr 
                END,
                imageUrlEn = CASE 
                    WHEN imageUrlEn IS NOT NULL AND imageUrlEn NOT LIKE '/%' 
                    THEN '/' + imageUrlEn 
                    ELSE imageUrlEn 
                END,
                pdfUrlTr = CASE 
                    WHEN pdfUrlTr IS NOT NULL AND pdfUrlTr NOT LIKE '/%' 
                    THEN '/' + pdfUrlTr 
                    ELSE pdfUrlTr 
                END,
                pdfUrlEn = CASE 
                    WHEN pdfUrlEn IS NOT NULL AND pdfUrlEn NOT LIKE '/%' 
                    THEN '/' + pdfUrlEn 
                    ELSE pdfUrlEn 
                END
            WHERE id IN (1, 2, 3, 4)
        `);
    }
} 