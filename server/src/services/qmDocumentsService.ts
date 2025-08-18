import AppDataSource from "../data-source";
import { QMDocumentsAndCertificates } from "../entity/QMDocumentsAndCertificates";
import { QMDocumentsAndCertificatesTranslations } from "../entity/QMDocumentsAndCertificatesTranslation";
import * as fs from "fs";
import * as path from "path";

export class QMDocumentsService {
  // Dosya silme yardımcı fonksiyonu
  private deleteFileIfExists(filePath: string): boolean {
    try {
      console.log(`🔍 Dosya kontrol ediliyor: ${filePath}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Dosya silindi: ${filePath}`);
        return true;
      } else {
        console.log(`⚠️ Dosya bulunamadı: ${filePath}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Dosya silinirken hata: ${filePath}`, error);
      return false;
    }
  }

  // Dosya yolu oluşturma yardımcı fonksiyonu
  private getPublicFilePath(relativePath: string): string {
    return path.join(__dirname, "../../public", relativePath);
  }

  // Tüm QM Documents'ları getir
  async getAllQMDocumentsAndCertificates(language: string) {
    try {
      const documentRepo = AppDataSource.getRepository(QMDocumentsAndCertificates);

      const documents = await documentRepo.find({
        relations: ["translations"],
        order: {
          type: "ASC",
          isInternational: "DESC",
          createdAt: "DESC"
        }
      });

      const formattedDocuments = documents.map((doc) => {
        // Uluslararası sertifikalar için tüm dillerde göster - EN dosyalarını kullan
        if (doc.isInternational) {
          const translation = doc.translations?.find((t) => t.language === language) || 
                            doc.translations?.find((t) => t.language === "en") ||
                            doc.translations?.[0];
          
          return {
            id: doc.id,
            title: translation?.title || "Untitled",
            description: translation?.description || "",
            imageUrl: doc.imageUrlEn ? (doc.imageUrlEn.startsWith('/') ? doc.imageUrlEn : `/${doc.imageUrlEn}`) : null, // Uluslararası sertifikalar için her zaman EN dosyası
            pdfUrl: doc.pdfUrlEn ? (doc.pdfUrlEn.startsWith('/') ? doc.pdfUrlEn : `/${doc.pdfUrlEn}`) : null,     // Uluslararası sertifikalar için her zaman EN dosyası
            type: doc.type,
            isInternational: doc.isInternational,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
          };
        } else {
          // Dokümantasyonlar için sadece tr ve en dillerinde göster
          if (language === "tr" || language === "en") {
            const translation = doc.translations?.find((t) => t.language === language);
            if (translation) {
              return {
                id: doc.id,
                title: translation.title || "Untitled",
                description: translation.description || "",
                imageUrl: language === 'tr' ? 
                  (doc.imageUrlTr ? (doc.imageUrlTr.startsWith('/') ? doc.imageUrlTr : `/${doc.imageUrlTr}`) : null) : 
                  (doc.imageUrlEn ? (doc.imageUrlEn.startsWith('/') ? doc.imageUrlEn : `/${doc.imageUrlEn}`) : null),
                pdfUrl: language === 'tr' ? 
                  (doc.pdfUrlTr ? (doc.pdfUrlTr.startsWith('/') ? doc.pdfUrlTr : `/${doc.pdfUrlTr}`) : null) : 
                  (doc.pdfUrlEn ? (doc.pdfUrlEn.startsWith('/') ? doc.pdfUrlEn : `/${doc.pdfUrlEn}`) : null),
                type: doc.type,
                isInternational: doc.isInternational,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
              };
            }
          } else {
            // Diğer dillerde en versiyonunu göster
            const translation = doc.translations?.find((t) => t.language === "en");
            if (translation) {
              return {
                id: doc.id,
                title: translation.title || "Untitled",
                description: translation.description || "",
                imageUrl: doc.imageUrlEn ? (doc.imageUrlEn.startsWith('/') ? doc.imageUrlEn : `/${doc.imageUrlEn}`) : null,
                pdfUrl: doc.pdfUrlEn ? (doc.pdfUrlEn.startsWith('/') ? doc.pdfUrlEn : `/${doc.pdfUrlEn}`) : null,
                type: doc.type,
                isInternational: doc.isInternational,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
              };
            }
          }
        }
        return null;
      }).filter(Boolean);

      return formattedDocuments;
    } catch (error) {
      console.error("QM Documents API hatası:", error);
      throw new Error("QM Documents alınamadı");
    }
  }

  // Belirli bir QM Document'ı getir
  async getQMDocumentAndCertificateById(id: number, language: string) {
    try {
      const documentRepo = AppDataSource.getRepository(QMDocumentsAndCertificates);

      const document = await documentRepo.findOne({
        where: { id },
        relations: ["translations"],
      });

      if (!document) {
        throw new Error("Doküman bulunamadı");
      }

      const translation = document.translations?.find((t) => t.language === language) ||
                        document.translations?.find((t) => t.language === "en") ||
                        document.translations?.[0];

      // Uluslararası sertifikalar için her zaman EN dosyalarını kullan
      const imageUrl = document.isInternational ? document.imageUrlEn : (language === 'tr' ? document.imageUrlTr : document.imageUrlEn);
      const pdfUrl = document.isInternational ? document.pdfUrlEn : (language === 'tr' ? document.pdfUrlTr : document.pdfUrlEn);

      return {
        id: document.id,
        title: translation?.title || "Untitled",
        description: translation?.description || "",
        imageUrl: imageUrl,
        pdfUrl: pdfUrl,
        type: document.type,
        isInternational: document.isInternational,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      };
    } catch (error) {
      console.error("QM Document API hatası:", error);
      throw error;
    }
  }

  // Yeni QM Document oluştur
  async createQMDocumentAndCertificate(documentData: any) {
    try {
      const documentRepo = AppDataSource.getRepository(QMDocumentsAndCertificates);
      const translationRepo = AppDataSource.getRepository(QMDocumentsAndCertificatesTranslations);

      const { title, description, type, isInternational, translations } = documentData;

      const newDocument = documentRepo.create({
        type: type || 'document',
        isInternational: isInternational || false,
        imageUrlTr: documentData.imageUrlTr,
        imageUrlEn: documentData.imageUrlEn,
        pdfUrlTr: documentData.pdfUrlTr,
        pdfUrlEn: documentData.pdfUrlEn
      });

      const savedDocument = await documentRepo.save(newDocument);

      // Çevirileri oluştur
      if (translations && Array.isArray(translations)) {
        for (const trans of translations) {
          const translation = translationRepo.create({
            language: trans.language,
            title: trans.title,
            description: trans.description,
            document: savedDocument
          });
          await translationRepo.save(translation);
        }
      }

      return {
        message: "QM Document başarıyla oluşturuldu",
        document: savedDocument
      };
    } catch (error) {
      console.error("QM Document oluşturma hatası:", error);
      throw error;
    }
  }

  // QM Document güncelle
  async updateQMDocumentAndCertificate(id: number, updateData: any) {
    try {
      console.log('=== UPDATE REQUEST ===');
      console.log('ID:', id);
      console.log('Body:', updateData);

      const documentRepo = AppDataSource.getRepository(QMDocumentsAndCertificates);
      const translationRepo = AppDataSource.getRepository(QMDocumentsAndCertificatesTranslations);

      const document = await documentRepo.findOne({
        where: { id },
        relations: ["translations"]
      });

      if (!document) {
        throw new Error("Doküman bulunamadı");
      }

      console.log('Current document:', {
        imageUrlTr: document.imageUrlTr,
        imageUrlEn: document.imageUrlEn,
        pdfUrlTr: document.pdfUrlTr,
        pdfUrlEn: document.pdfUrlEn
      });

      // Eski dosyaları sil
      const oldImageUrlTr = document.imageUrlTr;
      const oldImageUrlEn = document.imageUrlEn;
      const oldPdfUrlTr = document.pdfUrlTr;
      const oldPdfUrlEn = document.pdfUrlEn;

      // Ana doküman bilgilerini güncelle
      if (updateData.type !== undefined) document.type = updateData.type;
      if (updateData.isInternational !== undefined) document.isInternational = updateData.isInternational;
      
      // Dosya yollarını güncelle
      console.log('Checking file paths in request body:');
      console.log('imageUrlTr:', updateData.imageUrlTr, 'type:', typeof updateData.imageUrlTr);
      console.log('imageUrlEn:', updateData.imageUrlEn, 'type:', typeof updateData.imageUrlEn);
      console.log('pdfUrlTr:', updateData.pdfUrlTr, 'type:', typeof updateData.pdfUrlTr);
      console.log('pdfUrlEn:', updateData.pdfUrlEn, 'type:', typeof updateData.pdfUrlEn);
      
      if (updateData.imageUrlTr !== undefined) {
        console.log('Updating imageUrlTr from', document.imageUrlTr, 'to', updateData.imageUrlTr);
        document.imageUrlTr = updateData.imageUrlTr;
      }
      if (updateData.imageUrlEn !== undefined) {
        console.log('Updating imageUrlEn from', document.imageUrlEn, 'to', updateData.imageUrlEn);
        document.imageUrlEn = updateData.imageUrlEn;
      }
      if (updateData.pdfUrlTr !== undefined) {
        console.log('Updating pdfUrlTr from', document.pdfUrlTr, 'to', updateData.pdfUrlTr);
        document.pdfUrlTr = updateData.pdfUrlTr;
      }
      if (updateData.pdfUrlEn !== undefined) {
        console.log('Updating pdfUrlEn from', document.pdfUrlEn, 'to', updateData.pdfUrlEn);
        document.pdfUrlEn = updateData.pdfUrlEn;
      }

      console.log('Updated document:', {
        imageUrlTr: document.imageUrlTr,
        imageUrlEn: document.imageUrlEn,
        pdfUrlTr: document.pdfUrlTr,
        pdfUrlEn: document.pdfUrlEn
      });

      // updatedAt'i manuel olarak güncelle
      document.updatedAt = new Date();
      console.log('UpdatedAt set to:', document.updatedAt);

      await documentRepo.save(document);

      // Çevirileri güncelle
      if (updateData.translations && Array.isArray(updateData.translations)) {
        for (const trans of updateData.translations) {
          let translation = document.translations?.find(t => t.language === trans.language);
          
          if (translation) {
            translation.title = trans.title;
            translation.description = trans.description;
            await translationRepo.save(translation);
          } else {
            const newTranslation = translationRepo.create({
              language: trans.language,
              title: trans.title,
              description: trans.description,
              document: document
            });
            await translationRepo.save(newTranslation);
          }
        }
      }

      // Eski dosyaları sil (yeni dosya yüklendiyse)
      console.log('=== DOSYA SİLME İŞLEMİ ===');
      console.log('Eski dosyalar:', { oldImageUrlTr, oldImageUrlEn, oldPdfUrlTr, oldPdfUrlEn });
      console.log('Yeni dosyalar:', { 
        imageUrlTr: updateData.imageUrlTr, 
        imageUrlEn: updateData.imageUrlEn, 
        pdfUrlTr: updateData.pdfUrlTr, 
        pdfUrlEn: updateData.pdfUrlEn 
      });

      if (updateData.imageUrlTr && oldImageUrlTr && updateData.imageUrlTr !== oldImageUrlTr) {
        console.log('Eski TR resmi siliniyor:', oldImageUrlTr);
        this.deleteFileIfExists(this.getPublicFilePath(oldImageUrlTr));
      }
      if (updateData.imageUrlEn && oldImageUrlEn && updateData.imageUrlEn !== oldImageUrlEn) {
        console.log('Eski EN resmi siliniyor:', oldImageUrlEn);
        this.deleteFileIfExists(this.getPublicFilePath(oldImageUrlEn));
      }
      if (updateData.pdfUrlTr && oldPdfUrlTr && updateData.pdfUrlTr !== oldPdfUrlTr) {
        console.log('Eski TR PDF siliniyor:', oldPdfUrlTr);
        this.deleteFileIfExists(this.getPublicFilePath(oldPdfUrlTr));
      }
      if (updateData.pdfUrlEn && oldPdfUrlEn && updateData.pdfUrlEn !== oldPdfUrlEn) {
        console.log('Eski EN PDF siliniyor:', oldPdfUrlEn);
        this.deleteFileIfExists(this.getPublicFilePath(oldPdfUrlEn));
      }

      return {
        message: "QM Document başarıyla güncellendi",
        document: document
      };
    } catch (error) {
      console.error("QM Document güncelleme hatası:", error);
      throw error;
    }
  }

  // QM Document sil
  async deleteQMDocumentAndCertificate(id: number) {
    try {
      const documentRepo = AppDataSource.getRepository(QMDocumentsAndCertificates);

      const document = await documentRepo.findOne({
        where: { id }
      });

      if (!document) {
        throw new Error("Doküman bulunamadı");
      }

      // Dosyaları sil
      if (document.imageUrlTr) {
        this.deleteFileIfExists(this.getPublicFilePath(document.imageUrlTr));
      }
      if (document.imageUrlEn) {
        this.deleteFileIfExists(this.getPublicFilePath(document.imageUrlEn));
      }
      if (document.pdfUrlTr) {
        this.deleteFileIfExists(this.getPublicFilePath(document.pdfUrlTr));
      }
      if (document.pdfUrlEn) {
        this.deleteFileIfExists(this.getPublicFilePath(document.pdfUrlEn));
      }

      await documentRepo.remove(document);

      return { message: "QM Document başarıyla silindi" };
    } catch (error) {
      console.error("QM Document silme hatası:", error);
      throw error;
    }
  }
}

export default new QMDocumentsService();
