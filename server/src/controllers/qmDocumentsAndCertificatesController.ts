import { Request, Response } from "express";
import AppDataSource from "../data-source";
import { QMDocumentsAndCertificates } from "../entity/QMDocumentsAndCertificates";
import { QMDocumentsAndCertificatesTranslations } from "../entity/QMDocumentsAndCertificatesTranslation";
import * as fs from "fs";
import * as path from "path";

// Dosya silme yardımcı fonksiyonu
const deleteFileIfExists = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Dosya silindi: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Dosya silinirken hata: ${filePath}`, error);
    return false;
  }
};

// Dosya yolu oluşturma yardımcı fonksiyonu
const getPublicFilePath = (relativePath: string) => {
  return path.join(__dirname, "../../public", relativePath);
};

// Tüm QM Documents'ları getir
export const getAllQMDocumentsAndCertificates = async (req: Request, res: Response) => {
  const lang = (req.query.lang as string) || "tr";

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
      // Uluslararası sertifikalar için tüm dillerde göster
      if (doc.isInternational) {
        const translation = doc.translations?.find((t) => t.language === lang) || 
                          doc.translations?.find((t) => t.language === "en") ||
                          doc.translations?.[0];
        
        return {
          id: doc.id,
          slug: doc.slug,
          title: translation?.title || "Untitled",
          description: translation?.description || "",
          imageUrl: lang === 'tr' ? doc.imageUrlTr : doc.imageUrlEn,
          pdfUrl: lang === 'tr' ? doc.pdfUrlTr : doc.pdfUrlEn,
          type: doc.type,
          isInternational: doc.isInternational,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt
        };
      } else {
        // Dokümantasyonlar için sadece tr ve en dillerinde göster
        if (lang === "tr" || lang === "en") {
          const translation = doc.translations?.find((t) => t.language === lang);
          if (translation) {
            return {
              id: doc.id,
              slug: doc.slug,
              title: translation.title || "Untitled",
              description: translation.description || "",
              imageUrl: lang === 'tr' ? doc.imageUrlTr : doc.imageUrlEn,
              pdfUrl: lang === 'tr' ? doc.pdfUrlTr : doc.pdfUrlEn,
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
              slug: doc.slug,
              title: translation.title || "Untitled",
              description: translation.description || "",
              imageUrl: doc.imageUrlEn,
              pdfUrl: doc.pdfUrlEn,
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

    return res.json(formattedDocuments);
  } catch (err) {
    console.error("QM Documents API hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Belirli bir QM Document'ı getir
export const getQMDocumentAndCertificateById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const lang = (req.query.lang as string) || "tr";

  try {
    const documentRepo = AppDataSource.getRepository(QMDocumentsAndCertificates);

    const document = await documentRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["translations"],
    });

    if (!document) {
      return res.status(404).json({ message: "Doküman bulunamadı" });
    }

    const translation = document.translations?.find((t) => t.language === lang) ||
                      document.translations?.find((t) => t.language === "en") ||
                      document.translations?.[0];

    return res.json({
      id: document.id,
      slug: document.slug,
      title: translation?.title || "Untitled",
      description: translation?.description || "",
      imageUrl: lang === 'tr' ? document.imageUrlTr : document.imageUrlEn,
      pdfUrl: lang === 'tr' ? document.pdfUrlTr : document.pdfUrlEn,
      type: document.type,
      isInternational: document.isInternational,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    });
  } catch (err) {
    console.error("QM Document API hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Yeni QM Document oluştur
export const createQMDocumentAndCertificate = async (req: Request, res: Response) => {
  try {
    const documentRepo = AppDataSource.getRepository(QMDocumentsAndCertificates);
    const translationRepo = AppDataSource.getRepository(QMDocumentsAndCertificatesTranslations);

    const { title, description, type, isInternational, translations } = req.body;

    const newDocument = documentRepo.create({
      slug: title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      type: type || 'document',
      isInternational: isInternational || false,
      imageUrlTr: req.body.imageUrlTr,
      imageUrlEn: req.body.imageUrlEn,
      pdfUrlTr: req.body.pdfUrlTr,
      pdfUrlEn: req.body.pdfUrlEn
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

    return res.status(201).json({
      message: "QM Document başarıyla oluşturuldu",
      document: savedDocument
    });
  } catch (err) {
    console.error("QM Document oluşturma hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};

// QM Document güncelle
export const updateQMDocumentAndCertificate = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const documentRepo = AppDataSource.getRepository(QMDocumentsAndCertificates);
    const translationRepo = AppDataSource.getRepository(QMDocumentsAndCertificatesTranslations);

    const document = await documentRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["translations"]
    });

    if (!document) {
      return res.status(404).json({ message: "Doküman bulunamadı" });
    }

    // Ana doküman bilgilerini güncelle
    if (req.body.type !== undefined) document.type = req.body.type;
    if (req.body.isInternational !== undefined) document.isInternational = req.body.isInternational;
    if (req.body.imageUrlTr !== undefined) document.imageUrlTr = req.body.imageUrlTr;
    if (req.body.imageUrlEn !== undefined) document.imageUrlEn = req.body.imageUrlEn;
    if (req.body.pdfUrlTr !== undefined) document.pdfUrlTr = req.body.pdfUrlTr;
    if (req.body.pdfUrlEn !== undefined) document.pdfUrlEn = req.body.pdfUrlEn;

    await documentRepo.save(document);

    // Çevirileri güncelle
    if (req.body.translations && Array.isArray(req.body.translations)) {
      for (const trans of req.body.translations) {
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

    return res.json({
      message: "QM Document başarıyla güncellendi",
      document: document
    });
  } catch (err) {
    console.error("QM Document güncelleme hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};

// QM Document sil
export const deleteQMDocumentAndCertificate = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const documentRepo = AppDataSource.getRepository(QMDocumentsAndCertificates);

    const document = await documentRepo.findOne({
      where: { id: parseInt(id) }
    });

    if (!document) {
      return res.status(404).json({ message: "Doküman bulunamadı" });
    }

    // Dosyaları sil
    if (document.imageUrlTr) {
      deleteFileIfExists(getPublicFilePath(document.imageUrlTr));
    }
    if (document.imageUrlEn) {
      deleteFileIfExists(getPublicFilePath(document.imageUrlEn));
    }
    if (document.pdfUrlTr) {
      deleteFileIfExists(getPublicFilePath(document.pdfUrlTr));
    }
    if (document.pdfUrlEn) {
      deleteFileIfExists(getPublicFilePath(document.pdfUrlEn));
    }

    await documentRepo.remove(document);

    return res.json({ message: "QM Document başarıyla silindi" });
  } catch (err) {
    console.error("QM Document silme hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
}; 