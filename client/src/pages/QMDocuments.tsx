import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface QMDocument {
  id: number;
  slug: string;
  title: string;
  description: string;
  imageUrl?: string;
  pdfUrl?: string;
  type: 'certificate' | 'document';
  isInternational: boolean;
  createdAt: string;
  updatedAt: string;
}

const QMDocuments = () => {
  const { t, i18n } = useTranslation();
  const [documents, setDocuments] = useState<QMDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{url: string, title: string} | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);


  useEffect(() => {
    fetchDocuments();
  }, [i18n.language]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/qm-documents-and-certificates?lang=${i18n.language}`);
      
      if (!response.ok) {
        throw new Error('Dokümanlar yüklenirken hata oluştu');
      }
      
      const data = await response.json();
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPdf = (document: QMDocument) => {
    if (document.pdfUrl) {
      window.open(`http://localhost:5000${document.pdfUrl}`, '_blank');
    }
  };

  const handleImageClick = (imageUrl: string, title: string) => {
    setSelectedImage({ url: imageUrl, title });
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };



  const certificates = documents.filter(doc => doc.type === 'certificate');
  const regularDocuments = documents.filter(doc => doc.type === 'document');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">{t('common.error')}</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDocuments}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              {t('pages.qmDocuments.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {t('pages.qmDocuments.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 py-16">
                 {/* International Certificates */}
         {certificates.length > 0 && (
           <div className="mb-16">
             <div className="text-center mb-12">
               <h2 className="text-4xl font-bold text-gray-900 mb-4">
                 {t('pages.qmDocuments.internationalCertificates')}
               </h2>
               <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
             </div>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                               {certificates.map((certificate) => (
                  <div key={certificate.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {certificate.title}
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                          {t('pages.qmDocuments.certificate')}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      {certificate.imageUrl ? (
                        <div 
                          className="cursor-pointer group"
                          onClick={() => handleImageClick(`http://localhost:5000${certificate.imageUrl}`, certificate.title)}
                        >
                          <img 
                            src={`http://localhost:5000${certificate.imageUrl}`}
                            alt={certificate.title}
                            className="w-full h-56 object-cover group-hover:opacity-90 transition-opacity duration-300"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                        {certificate.description}
                      </p>
                      {certificate.pdfUrl && (
                        <button
                          onClick={() => handleViewPdf(certificate)}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {t('pages.qmDocuments.viewDocument')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
             </div>
           </div>
         )}

                 {/* Regular Documents */}
         {regularDocuments.length > 0 && (
           <div>
             <div className="text-center mb-12">
               <h2 className="text-4xl font-bold text-gray-900 mb-4">
                 {t('pages.qmDocuments.documents')}
               </h2>
               <div className="w-24 h-1 bg-green-600 mx-auto rounded-full"></div>
             </div>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                               {regularDocuments.map((document) => (
                  <div key={document.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {document.title}
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                          {t('pages.qmDocuments.document')}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      {document.imageUrl ? (
                        <div 
                          className="cursor-pointer group"
                          onClick={() => handleImageClick(`http://localhost:5000${document.imageUrl}`, document.title)}
                        >
                          <img 
                            src={`http://localhost:5000${document.imageUrl}`}
                            alt={document.title}
                            className="w-full h-56 object-cover group-hover:opacity-90 transition-opacity duration-300"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                        {document.description}
                      </p>
                      {document.pdfUrl && (
                        <button
                          onClick={() => handleViewPdf(document)}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {t('pages.qmDocuments.viewDocument')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
             </div>
           </div>
         )}

                 {/* Empty State */}
         {documents.length === 0 && !loading && (
           <div className="text-center py-20">
             <div className="inline-flex items-center justify-center w-32 h-32 bg-gray-100 rounded-full mb-8">
               <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
             </div>
             <h3 className="text-3xl font-bold text-gray-600 mb-4">
               {t('pages.qmDocuments.noDocuments')}
             </h3>
             <p className="text-xl text-gray-500 max-w-2xl mx-auto">
               {t('pages.qmDocuments.noDocumentsDesc')}
             </p>
           </div>
                   )}
       </div>

       {/* Image Modal */}
       {showImageModal && selectedImage && (
         <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
           <div className="relative max-w-4xl max-h-[90vh] w-full">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-2xl font-bold text-white">
                 {selectedImage.title}
               </h3>
               <button
                 onClick={closeImageModal}
                 className="text-white hover:text-gray-300 transition-colors p-2"
               >
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>
             <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
               <img
                 src={selectedImage.url}
                 alt={selectedImage.title}
                 className="w-full h-auto max-h-[70vh] object-contain"
               />
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default QMDocuments; 