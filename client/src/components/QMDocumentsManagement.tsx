import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiDownload } from 'react-icons/fi';

interface QMDocument {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  pdfUrl?: string;
  type: 'certificate' | 'document';
  isInternational: boolean;
  createdAt: string;
  updatedAt: string;
}

const QMDocumentsManagement: React.FC = () => {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<QMDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'certificate' | 'document'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<QMDocument | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document' as 'certificate' | 'document',
    isInternational: false,
    translations: [
      { language: 'tr', title: '', description: '' },
      { language: 'en', title: '', description: '' }
    ]
  });

  const [files, setFiles] = useState({
    imageTr: null as File | null,
    imageEn: null as File | null,
    pdfTr: null as File | null,
    pdfEn: null as File | null
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/qm-documents-and-certificates?lang=tr');
      
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

  const filteredDocuments = documents.filter(doc => {
    if (selectedType === 'all') return true;
    return doc.type === selectedType;
  });

  const getTypeBadge = (type: string, isInternational: boolean) => {
    if (type === 'certificate') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {isInternational ? '🌍 Uluslararası Sertifika' : '🏆 Sertifika'}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          📄 Doküman
        </span>
      );
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTranslationChange = (language: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: prev.translations.map(trans => 
        trans.language === language 
          ? { ...trans, [field]: value }
          : trans
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Önce dosyaları yükle
      const uploadPromises: Promise<{ field: string; path: string }>[] = [];

      if (formData.isInternational) {
        // Uluslararası sertifikalar için sadece EN dosyaları
        if (files.imageEn) {
          uploadPromises.push(
            uploadFile(files.imageEn, formData.type, 'en', 'image')
              .then(path => ({ field: 'imageUrlEn', path }))
          );
        }
        if (files.pdfEn) {
          uploadPromises.push(
            uploadFile(files.pdfEn, formData.type, 'en', 'pdf')
              .then(path => ({ field: 'pdfUrlEn', path }))
          );
        }
      } else {
        // Normal dokümanlar için TR ve EN dosyaları
        if (files.imageTr) {
          uploadPromises.push(
            uploadFile(files.imageTr, formData.type, 'tr', 'image')
              .then(path => ({ field: 'imageUrlTr', path }))
          );
        }
        if (files.imageEn) {
          uploadPromises.push(
            uploadFile(files.imageEn, formData.type, 'en', 'image')
              .then(path => ({ field: 'imageUrlEn', path }))
          );
        }
        if (files.pdfTr) {
          uploadPromises.push(
            uploadFile(files.pdfTr, formData.type, 'tr', 'pdf')
              .then(path => ({ field: 'pdfUrlTr', path }))
          );
        }
        if (files.pdfEn) {
          uploadPromises.push(
            uploadFile(files.pdfEn, formData.type, 'en', 'pdf')
              .then(path => ({ field: 'pdfUrlEn', path }))
          );
        }
      }

      // Dosyaları yükle
      const uploadResults = await Promise.all(uploadPromises);
      
      // Doküman verilerini hazırla
      const documentData = {
        ...formData,
        ...uploadResults.reduce((acc, result) => {
          acc[result.field] = result.path;
          return acc;
        }, {} as any)
      };

      // Dokümanı kaydet
      const response = await fetch('http://localhost:5000/api/qm-documents-and-certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        throw new Error('Doküman eklenirken hata oluştu');
      }

      // Form'u temizle ve modal'ı kapat
      resetForm();
      setShowAddModal(false);
      
      // Listeyi yenile
      fetchDocuments();
      
    } catch (err) {
      console.error('Doküman ekleme hatası:', err);
      alert(err instanceof Error ? err.message : 'Bilinmeyen hata');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'document',
      isInternational: false,
      translations: [
        { language: 'tr', title: '', description: '' },
        { language: 'en', title: '', description: '' }
      ]
    });
    setFiles({
      imageTr: null,
      imageEn: null,
      pdfTr: null,
      pdfEn: null
    });
  };

  const handleEdit = (document: QMDocument) => {
    setEditingDocument(document);
    setFormData({
      title: document.title,
      description: document.description,
      type: document.type,
      isInternational: document.isInternational,
      translations: [
        { language: 'tr', title: document.title, description: document.description },
        { language: 'en', title: document.title, description: document.description }
      ]
    });
    setFiles({
      imageTr: null,
      imageEn: null,
      pdfTr: null,
      pdfEn: null
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDocument) return;

    try {
      const uploadPromises: Promise<{ field: string; path: string }>[] = [];

      // Dosya yükleme işlemleri
      if (formData.isInternational) {
        // Uluslararası sertifika - sadece EN dosyaları
        if (files.imageEn) {
          uploadPromises.push(
            uploadFile(files.imageEn, formData.type, 'en', 'image').then(result => ({
              field: 'imageUrlEn',
              path: result
            }))
          );
        }
        if (files.pdfEn) {
          uploadPromises.push(
            uploadFile(files.pdfEn, formData.type, 'en', 'pdf').then(result => ({
              field: 'pdfUrlEn',
              path: result
            }))
          );
        }
      } else {
        // Normal doküman - TR ve EN dosyaları
        if (files.imageTr) {
          uploadPromises.push(
            uploadFile(files.imageTr, formData.type, 'tr', 'image').then(result => ({
              field: 'imageUrlTr',
              path: result
            }))
          );
        }
        if (files.imageEn) {
          uploadPromises.push(
            uploadFile(files.imageEn, formData.type, 'en', 'image').then(result => ({
              field: 'imageUrlEn',
              path: result
            }))
          );
        }
        if (files.pdfTr) {
          uploadPromises.push(
            uploadFile(files.pdfTr, formData.type, 'tr', 'pdf').then(result => ({
              field: 'pdfUrlTr',
              path: result
            }))
          );
        }
        if (files.pdfEn) {
          uploadPromises.push(
            uploadFile(files.pdfEn, formData.type, 'en', 'pdf').then(result => ({
              field: 'pdfUrlEn',
              path: result
            }))
          );
        }
      }

      console.log('Upload promises:', uploadPromises);
      const uploadResults = await Promise.all(uploadPromises);
      console.log('Upload results:', uploadResults);

      // Dosya güncellemelerini hazırla
      const fileUpdates = uploadResults.reduce((acc, result) => {
        acc[result.field] = result.path;
        return acc;
      }, {} as any);

      console.log('File updates:', fileUpdates);

      // Mevcut dosya yollarını al
      const currentDoc = documents.find(d => d.id === editingDocument.id);
      console.log('Current document from list:', currentDoc);

      // Dosya yollarını hazırla - yeni dosya yüklenmediyse mevcut dosyaları koru
      const finalFilePaths = {
        imageUrlTr: fileUpdates.imageUrlTr || (currentDoc?.imageUrl ? currentDoc.imageUrl.replace('http://localhost:5000', '') : null),
        imageUrlEn: fileUpdates.imageUrlEn || (currentDoc?.imageUrl ? currentDoc.imageUrl.replace('http://localhost:5000', '') : null),
        pdfUrlTr: fileUpdates.pdfUrlTr || (currentDoc?.pdfUrl ? currentDoc.pdfUrl.replace('http://localhost:5000', '') : null),
        pdfUrlEn: fileUpdates.pdfUrlEn || (currentDoc?.pdfUrl ? currentDoc.pdfUrl.replace('http://localhost:5000', '') : null)
      };

      console.log('Final file paths:', finalFilePaths);

      const documentData = {
        ...formData,
        ...finalFilePaths
      };

      console.log('Sending update data:', documentData);

      const response = await fetch(`http://localhost:5000/api/qm-documents-and-certificates/${editingDocument.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        throw new Error('Güncelleme başarısız');
      }

      await fetchDocuments();
      setShowEditModal(false);
      setEditingDocument(null);
      resetForm();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Güncelleme sırasında hata oluştu');
    }
  };

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const uploadFile = async (file: File, documentType: string, language: string, fileType: 'image' | 'pdf') => {
    try {
      console.log('Uploading file:', {
        fileName: file.name,
        fileSize: file.size,
        fileMimeType: file.type,
        documentType,
        language,
        fileType
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      formData.append('language', language);
      formData.append('fileType', fileType);

      console.log('FormData created:', {
        hasFile: formData.has('file'),
        hasDocumentType: formData.has('documentType'),
        hasLanguage: formData.has('language'),
        hasFileType: formData.has('fileType')
      });

      // URL parametreleri ile birlikte gönder
      const url = `http://localhost:5000/api/upload/qm-documents?documentType=${documentType}&language=${language}&fileType=${fileType}`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Dosya yüklenirken hata oluştu: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload success result:', result);
      return result.fullPath;
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Hata</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchDocuments}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QM Documents & Certificates Yönetimi</h1>
          <p className="text-gray-600 mt-2">Sertifika ve dokümanlarınızı yönetin</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Yeni Ekle
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tümü ({documents.length})
            </button>
            <button
              onClick={() => setSelectedType('certificate')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === 'certificate'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sertifikalar ({documents.filter(d => d.type === 'certificate').length})
            </button>
            <button
              onClick={() => setSelectedType('document')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === 'document'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Dokümanlar ({documents.filter(d => d.type === 'document').length})
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Görsel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex-shrink-0 h-12 w-12">
                      {doc.imageUrl ? (
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={`http://localhost:5000${doc.imageUrl}`}
                          alt={doc.title}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{doc.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(doc.type, doc.isInternational)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {doc.imageUrl && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          📷 Resim
                        </span>
                      )}
                      {doc.pdfUrl && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          📄 PDF
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(doc.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1">
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(doc)}
                        className="text-green-600 hover:text-green-900 p-1"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-1">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {selectedType === 'all' ? 'Henüz doküman yok' : `${selectedType === 'certificate' ? 'Sertifika' : 'Doküman'} bulunamadı`}
            </h3>
            <p className="text-gray-500">
              {selectedType === 'all' 
                ? 'İlk dokümanınızı ekleyerek başlayın.' 
                : `Bu kategoride henüz ${selectedType === 'certificate' ? 'sertifika' : 'doküman'} bulunmuyor.`
              }
            </p>
          </div>
                 )}
       </div>

       {/* Add Document Modal */}
       {showAddModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center p-6 border-b border-gray-200">
               <h2 className="text-2xl font-bold text-gray-900">Yeni Doküman Ekle</h2>
               <button
                 onClick={() => {
                   setShowAddModal(false);
                   resetForm();
                 }}
                 className="text-gray-500 hover:text-gray-700 transition-colors"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>

             <form onSubmit={handleSubmit} className="p-6 space-y-6">
               {/* Basic Information */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Doküman Tipi
                   </label>
                   <select
                     value={formData.type}
                     onChange={(e) => handleInputChange('type', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   >
                     <option value="document">📄 Doküman</option>
                     <option value="certificate">🏆 Sertifika</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Uluslararası
                   </label>
                   <div className="flex items-center">
                     <input
                       type="checkbox"
                       checked={formData.isInternational}
                       onChange={(e) => handleInputChange('isInternational', e.target.checked)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                     />
                     <label className="ml-2 text-sm text-gray-700">
                       Bu doküman uluslararası mı? (Sertifikalar için önerilir)
                     </label>
                   </div>
                 </div>
               </div>

               {/* Turkish Translation */}
               <div className="border-t pt-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">🇹🇷 Türkçe İçerik</h3>
                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Başlık (TR)
                     </label>
                     <input
                       type="text"
                       value={formData.translations.find(t => t.language === 'tr')?.title || ''}
                       onChange={(e) => handleTranslationChange('tr', 'title', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       placeholder="Türkçe başlık girin"
                       required
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Açıklama (TR)
                     </label>
                     <textarea
                       value={formData.translations.find(t => t.language === 'tr')?.description || ''}
                       onChange={(e) => handleTranslationChange('tr', 'description', e.target.value)}
                       rows={3}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       placeholder="Türkçe açıklama girin"
                       required
                     />
                   </div>
                 </div>
               </div>

               {/* English Translation */}
               <div className="border-t pt-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">🇬🇧 English Content</h3>
                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Title (EN)
                     </label>
                     <input
                       type="text"
                       value={formData.translations.find(t => t.language === 'en')?.title || ''}
                       onChange={(e) => handleTranslationChange('en', 'title', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       placeholder="Enter English title"
                       required
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Description (EN)
                     </label>
                     <textarea
                       value={formData.translations.find(t => t.language === 'en')?.description || ''}
                       onChange={(e) => handleTranslationChange('en', 'description', e.target.value)}
                       rows={3}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       placeholder="Enter English description"
                       required
                     />
                   </div>
                 </div>
               </div>

                               {/* File Upload Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📁 Dosya Yükleme</h3>
                  
                  {formData.isInternational ? (
                    // Uluslararası sertifikalar için sadece EN dosyaları
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Uluslararası Sertifika</h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>Uluslararası sertifikalar için sadece İngilizce (EN) dosyaları yükleyin.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            📷 Resim (EN) *
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange('imageEn', e.target.files?.[0] || null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          {files.imageEn && (
                            <p className="text-sm text-green-600 mt-1">✓ {files.imageEn.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            📄 PDF (EN) *
                          </label>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileChange('pdfEn', e.target.files?.[0] || null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          {files.pdfEn && (
                            <p className="text-sm text-green-600 mt-1">✓ {files.pdfEn.name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Normal dokümanlar için TR ve EN dosyaları
                    <div className="space-y-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">Çoklu Dil Desteği</h3>
                            <div className="mt-2 text-sm text-green-700">
                              <p>Türkçe ve İngilizce dosyaları ayrı ayrı yükleyin.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Türkçe Dosyalar */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">🇹🇷 Türkçe Dosyalar</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              📷 Resim (TR) *
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange('imageTr', e.target.files?.[0] || null)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                            {files.imageTr && (
                              <p className="text-sm text-green-600 mt-1">✓ {files.imageTr.name}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              📄 PDF (TR) *
                            </label>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handleFileChange('pdfTr', e.target.files?.[0] || null)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                            {files.pdfTr && (
                              <p className="text-sm text-green-600 mt-1">✓ {files.pdfTr.name}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* İngilizce Dosyalar */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">🇬🇧 İngilizce Dosyalar</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              📷 Resim (EN) *
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange('imageEn', e.target.files?.[0] || null)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                            {files.imageEn && (
                              <p className="text-sm text-green-600 mt-1">✓ {files.imageEn.name}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              📄 PDF (EN) *
                            </label>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handleFileChange('pdfEn', e.target.files?.[0] || null)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                            {files.pdfEn && (
                              <p className="text-sm text-green-600 mt-1">✓ {files.pdfEn.name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

               {/* Form Actions */}
               <div className="flex justify-end gap-3 pt-6 border-t">
                 <button
                   type="button"
                   onClick={() => {
                     setShowAddModal(false);
                     resetForm();
                   }}
                   className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                 >
                   İptal
                 </button>
                 <button
                   type="submit"
                   className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                 >
                   Dokümanı Kaydet
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* Edit Document Modal */}
       {showEditModal && editingDocument && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center p-6 border-b border-gray-200">
               <h2 className="text-2xl font-bold text-gray-900">Dokümanı Düzenle</h2>
               <button
                 onClick={() => {
                   setShowEditModal(false);
                   setEditingDocument(null);
                   resetForm();
                 }}
                 className="text-gray-500 hover:text-gray-700 transition-colors"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>

             <form onSubmit={handleUpdate} className="p-6 space-y-6">
               {/* Basic Information */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Doküman Tipi
                   </label>
                   <select
                     value={formData.type}
                     onChange={(e) => handleInputChange('type', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   >
                     <option value="document">📄 Doküman</option>
                     <option value="certificate">🏆 Sertifika</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Uluslararası
                   </label>
                   <div className="flex items-center">
                     <input
                       type="checkbox"
                       checked={formData.isInternational}
                       onChange={(e) => handleInputChange('isInternational', e.target.checked)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                     />
                     <label className="ml-2 text-sm text-gray-700">
                       Uluslararası sertifika (sadece EN dosyaları)
                     </label>
                   </div>
                 </div>
               </div>

               {/* Translations */}
               <div>
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Çeviriler</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <h4 className="text-md font-medium text-gray-700 mb-3">🇹🇷 Türkçe</h4>
                     <div className="space-y-3">
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                           Başlık
                         </label>
                         <input
                           type="text"
                           value={formData.translations[0].title}
                           onChange={(e) => handleTranslationChange('tr', 'title', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           required
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                           Açıklama
                         </label>
                         <textarea
                           value={formData.translations[0].description}
                           onChange={(e) => handleTranslationChange('tr', 'description', e.target.value)}
                           rows={3}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           required
                         />
                       </div>
                     </div>
                   </div>
                   <div>
                     <h4 className="text-md font-medium text-gray-700 mb-3">🇬🇧 İngilizce</h4>
                     <div className="space-y-3">
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                           Title
                         </label>
                         <input
                           type="text"
                           value={formData.translations[1].title}
                           onChange={(e) => handleTranslationChange('en', 'title', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           required
                         />
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                           Description
                         </label>
                         <textarea
                           value={formData.translations[1].description}
                           onChange={(e) => handleTranslationChange('en', 'description', e.target.value)}
                           rows={3}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           required
                         />
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* File Uploads */}
               <div>
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Dosya Yüklemeleri</h3>
                 
                 {/* Mevcut Dosyalar */}
                 <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                   <h4 className="text-md font-medium text-gray-700 mb-3">📁 Mevcut Dosyalar</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {editingDocument.imageUrl && (
                       <div className="flex items-center gap-2">
                         <span className="text-sm text-gray-600">📷 Resim:</span>
                         <span className="text-sm text-blue-600">{editingDocument.imageUrl.split('/').pop()}</span>
                       </div>
                     )}
                     {editingDocument.pdfUrl && (
                       <div className="flex items-center gap-2">
                         <span className="text-sm text-gray-600">📄 PDF:</span>
                         <span className="text-sm text-blue-600">{editingDocument.pdfUrl.split('/').pop()}</span>
                       </div>
                     )}
                   </div>
                 </div>

                 {formData.isInternational ? (
                   // Uluslararası sertifika - sadece EN dosyaları
                   <div className="space-y-6">
                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                       <div className="flex">
                         <div className="flex-shrink-0">
                           <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                         </div>
                         <div className="ml-3">
                           <h3 className="text-sm font-medium text-blue-800">Uluslararası Sertifika</h3>
                           <div className="mt-2 text-sm text-blue-700">
                             <p>Sadece İngilizce dosyaları yükleyin. Diğer dillerde de İngilizce versiyonu gösterilecek.</p>
                           </div>
                         </div>
                       </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">
                           📷 Resim (EN) - Yeni dosya seçerseniz eskisi silinecek
                         </label>
                         <input
                           type="file"
                           accept="image/*"
                           onChange={(e) => handleFileChange('imageEn', e.target.files?.[0] || null)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                         />
                         {files.imageEn && (
                           <p className="text-sm text-green-600 mt-1">✓ {files.imageEn.name}</p>
                         )}
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">
                           📄 PDF (EN) - Yeni dosya seçerseniz eskisi silinecek
                         </label>
                         <input
                           type="file"
                           accept=".pdf"
                           onChange={(e) => handleFileChange('pdfEn', e.target.files?.[0] || null)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                         />
                         {files.pdfEn && (
                           <p className="text-sm text-green-600 mt-1">✓ {files.pdfEn.name}</p>
                         )}
                       </div>
                     </div>
                   </div>
                 ) : (
                   // Normal dokümanlar için TR ve EN dosyaları
                   <div className="space-y-6">
                     <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                       <div className="flex">
                         <div className="flex-shrink-0">
                           <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                         </div>
                         <div className="ml-3">
                           <h3 className="text-sm font-medium text-green-800">Çoklu Dil Desteği</h3>
                           <div className="mt-2 text-sm text-green-700">
                             <p>Türkçe ve İngilizce dosyaları ayrı ayrı yükleyin. Yeni dosya seçerseniz eskisi silinecek.</p>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Türkçe Dosyalar */}
                     <div>
                       <h4 className="text-md font-semibold text-gray-900 mb-3">🇹🇷 Türkçe Dosyalar</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             📷 Resim (TR) - Yeni dosya seçerseniz eskisi silinecek
                           </label>
                           <input
                             type="file"
                             accept="image/*"
                             onChange={(e) => handleFileChange('imageTr', e.target.files?.[0] || null)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           />
                           {files.imageTr && (
                             <p className="text-sm text-green-600 mt-1">✓ {files.imageTr.name}</p>
                           )}
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             📄 PDF (TR) - Yeni dosya seçerseniz eskisi silinecek
                           </label>
                           <input
                             type="file"
                             accept=".pdf"
                             onChange={(e) => handleFileChange('pdfTr', e.target.files?.[0] || null)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           />
                           {files.pdfTr && (
                             <p className="text-sm text-green-600 mt-1">✓ {files.pdfTr.name}</p>
                           )}
                         </div>
                       </div>
                     </div>

                     {/* İngilizce Dosyalar */}
                     <div>
                       <h4 className="text-md font-semibold text-gray-900 mb-3">🇬🇧 İngilizce Dosyalar</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             📷 Resim (EN) - Yeni dosya seçerseniz eskisi silinecek
                           </label>
                           <input
                             type="file"
                             accept="image/*"
                             onChange={(e) => handleFileChange('imageEn', e.target.files?.[0] || null)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           />
                           {files.imageEn && (
                             <p className="text-sm text-green-600 mt-1">✓ {files.imageEn.name}</p>
                           )}
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             📄 PDF (EN) - Yeni dosya seçerseniz eskisi silinecek
                           </label>
                           <input
                             type="file"
                             accept=".pdf"
                             onChange={(e) => handleFileChange('pdfEn', e.target.files?.[0] || null)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           />
                           {files.pdfEn && (
                             <p className="text-sm text-green-600 mt-1">✓ {files.pdfEn.name}</p>
                           )}
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
               </div>

               {/* Form Actions */}
               <div className="flex justify-end gap-3 pt-6 border-t">
                 <button
                   type="button"
                   onClick={() => {
                     setShowEditModal(false);
                     setEditingDocument(null);
                     resetForm();
                   }}
                   className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                 >
                   İptal
                 </button>
                 <button
                   type="submit"
                   className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                 >
                   Güncelle
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}
     </div>
   );
 };

export default QMDocumentsManagement; 