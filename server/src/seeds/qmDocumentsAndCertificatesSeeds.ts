import { AppDataSource } from "../data-source";
import { QMDocumentsAndCertificates } from "../entity/QMDocumentsAndCertificates";
import { QMDocumentsAndCertificatesTranslations } from "../entity/QMDocumentsAndCertificatesTranslation";

const seedQMDocumentsAndCertificates = async () => {
  try {
    await AppDataSource.initialize();

    const qmDocumentsRepository = AppDataSource.getRepository(QMDocumentsAndCertificates);
    const translationsRepository = AppDataSource.getRepository(QMDocumentsAndCertificatesTranslations);

    // Mevcut verileri temizle
    await translationsRepository.delete({});
    await qmDocumentsRepository.delete({});

    // Örnek veriler
    const documents = [
      {
        slug: "iso-9001-sertifikasi",
        imageUrlTr: "uploads/qm-documents-and-certificates/images/tr/ISO-9001.jpg",
        imageUrlEn: "uploads/qm-documents-and-certificates/images/en/ISO-9001.jpg",
        pdfUrlTr: "uploads/qm-documents-and-certificates/pdfs/tr/ISO-9001.pdf",
        pdfUrlEn: "uploads/qm-documents-and-certificates/pdfs/en/ISO-9001.pdf",
        type: "certificate" as const,
        isInternational: true,
        translations: [
          {
            language: "tr",
            title: "ISO 9001 Kalite Yönetim Sistemi Sertifikası",
            description: "ISO 9001 Kalite Yönetim Sistemi standardına uygunluk sertifikamız. Bu sertifika, kalite yönetim sistemimizin uluslararası standartlara uygun olduğunu belgeler."
          },
          {
            language: "en",
            title: "ISO 9001 Quality Management System Certificate",
            description: "Our ISO 9001 Quality Management System compliance certificate. This certificate documents that our quality management system meets international standards."
          }
        ]
      },
      {
        slug: "iso-14001-sertifikasi",
        imageUrlTr: "uploads/qm-documents-and-certificates/images/tr/ISO-14001.jpg",
        imageUrlEn: "uploads/qm-documents-and-certificates/images/en/ISO-14001.jpg",
        pdfUrlTr: "uploads/qm-documents-and-certificates/pdfs/tr/ISO-14001.pdf",
        pdfUrlEn: "uploads/qm-documents-and-certificates/pdfs/en/ISO-14001.pdf",
        type: "certificate" as const,
        isInternational: true,
        translations: [
          {
            language: "tr",
            title: "ISO 14001 Çevre Yönetim Sistemi Sertifikası",
            description: "ISO 14001 Çevre Yönetim Sistemi standardına uygunluk sertifikamız. Bu sertifika, çevre yönetim sistemimizin uluslararası standartlara uygun olduğunu belgeler."
          },
          {
            language: "en",
            title: "ISO 14001 Environmental Management System Certificate",
            description: "Our ISO 14001 Environmental Management System compliance certificate. This certificate documents that our environmental management system meets international standards."
          }
        ]
      },
      {
        slug: "kalite-politikasi",
        imageUrlTr: "uploads/qm-documents-and-certificates/images/tr/Kalite-Politikasi.jpg",
        imageUrlEn: "uploads/qm-documents-and-certificates/images/en/Quality-Policy.jpg",
        pdfUrlTr: "uploads/qm-documents-and-certificates/pdfs/tr/Kalite-Politikasi.pdf",
        pdfUrlEn: "uploads/qm-documents-and-certificates/pdfs/en/Quality-Policy.pdf",
        type: "document" as const,
        isInternational: false,
        translations: [
          {
            language: "tr",
            title: "Kalite Politikası",
            description: "Şirketimizin kalite politikası ve kalite hedeflerimizi içeren doküman. Müşteri memnuniyeti odaklı kalite yaklaşımımızı detaylandırır."
          },
          {
            language: "en",
            title: "Quality Policy",
            description: "Document containing our company's quality policy and quality objectives. Details our customer satisfaction focused quality approach."
          }
        ]
      },
      {
        slug: "uretim-proseduru",
        imageUrlTr: "uploads/qm-documents-and-certificates/images/tr/Uretim-Proseduru.jpg",
        imageUrlEn: "uploads/qm-documents-and-certificates/images/en/Manufacturing-Procedure.jpg",
        pdfUrlTr: "uploads/qm-documents-and-certificates/pdfs/tr/Uretim-Proseduru.pdf",
        pdfUrlEn: "uploads/qm-documents-and-certificates/pdfs/en/Manufacturing-Procedure.pdf",
        type: "document" as const,
        isInternational: false,
        translations: [
          {
            language: "tr",
            title: "Üretim Prosedürü",
            description: "Üretim süreçlerimizi ve kalite kontrol prosedürlerimizi detaylandıran doküman. Standart üretim süreçlerimizi tanımlar."
          },
          {
            language: "en",
            title: "Manufacturing Procedure",
            description: "Document detailing our manufacturing processes and quality control procedures. Defines our standard manufacturing processes."
          }
        ]
      },
      {
        slug: "ce-sertifikasi",
        imageUrlTr: "uploads/qm-documents-and-certificates/images/tr/CE-Sertifikasi.jpg",
        imageUrlEn: "uploads/qm-documents-and-certificates/images/en/CE-Certification.jpg",
        pdfUrlTr: "uploads/qm-documents-and-certificates/pdfs/tr/CE-Sertifikasi.pdf",
        pdfUrlEn: "uploads/qm-documents-and-certificates/pdfs/en/CE-Certification.pdf",
        type: "certificate" as const,
        isInternational: true,
        translations: [
          {
            language: "tr",
            title: "CE Sertifikası",
            description: "Avrupa Birliği standartlarına uygunluk belgesi. Ürünlerimizin Avrupa pazarında satışı için gerekli olan CE işaretlemesi sertifikası."
          },
          {
            language: "en",
            title: "CE Certificate",
            description: "European Union compliance certificate. CE marking certificate required for selling our products in the European market."
          }
        ]
      }
    ];

    // Verileri ekle
    for (const docData of documents) {
      const { translations, ...documentData } = docData;
      
      const document = qmDocumentsRepository.create(documentData);
      const savedDocument = await qmDocumentsRepository.save(document);

      // Çevirileri ekle
      for (const translationData of translations) {
        const translation = translationsRepository.create({
          ...translationData,
          document: savedDocument
        });
        await translationsRepository.save(translation);
      }
    }

    console.log("QM Documents and Certificates seed data başarıyla eklendi!");
    await AppDataSource.destroy();
  } catch (error) {
    console.error("Seed data eklenirken hata oluştu:", error);
    await AppDataSource.destroy();
  }
};

// Script çalıştırılırsa seed'i çalıştır
if (require.main === module) {
  seedQMDocumentsAndCertificates();
}

export default seedQMDocumentsAndCertificates; 