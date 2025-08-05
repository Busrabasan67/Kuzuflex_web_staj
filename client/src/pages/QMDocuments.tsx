import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface QMDocument {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  pdfUrl?: string;
  type: "certificate" | "document";
  isInternational: boolean;
  createdAt: string;
  updatedAt: string;
}

const QMDocuments = () => {
  const { t, i18n } = useTranslation();
  const [documents, setDocuments] = useState<QMDocument[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<QMDocument[]>([]);
  const [selectedType, setSelectedType] = useState<"certificate" | "document">("certificate");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalImage, setModalImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/qm-documents-and-certificates?lang=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data);
        setFilteredDocs(data.filter((d: QMDocument) => d.type === "certificate"));
      });
  }, [i18n.language]);

  useEffect(() => {
    const filtered = documents
      .filter((doc) => doc.type === selectedType)
      .filter((doc) => doc.title.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredDocs(filtered);
  }, [searchTerm, selectedType, documents]);

  const openModal = (url: string, title: string) => setModalImage({ url, title });
  const closeModal = () => setModalImage(null);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800">{t("pages.qmDocuments.title")}</h1>
          <p className="text-gray-600 mt-2">{t("pages.qmDocuments.description")}</p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedType === "certificate"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setSelectedType("certificate")}
            >
              {t("pages.qmDocuments.certificates")}
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedType === "document"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setSelectedType("document")}
            >
              {t("pages.qmDocuments.documents")}
            </button>
          </div>

          <input
            type="text"
            placeholder={t("common.search")}
            className="px-4 py-2 rounded-lg border border-gray-300 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden border"
            >
                             {doc.imageUrl ? (
                 <img
                   src={`http://localhost:5000${doc.imageUrl}`}
                   alt={doc.title}
                   className="w-full h-48 object-contain cursor-pointer bg-gray-50"
                   onClick={() => openModal(`http://localhost:5000${doc.imageUrl}`, doc.title)}
                 />
               ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">{t("pages.qmDocuments.noImage")}</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{doc.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-3">{doc.description}</p>
                {doc.pdfUrl && (
                  <a
                    href={`http://localhost:5000${doc.pdfUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {t("pages.qmDocuments.viewDocument")}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

                 {/* Modal */}
         {modalImage && (
           <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
             <div className="relative max-w-6xl w-full max-h-[95vh]">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-white">{modalImage.title}</h2>
                 <button 
                   onClick={closeModal} 
                   className="text-white hover:text-gray-300 transition-colors p-2"
                 >
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>
               <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
                 <img 
                   src={modalImage.url} 
                   alt={modalImage.title} 
                   className="w-full h-auto max-h-[85vh] object-contain"
                   style={{ maxWidth: '100%', height: 'auto' }}
                 />
               </div>
             </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default QMDocuments;
