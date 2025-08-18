import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCatalogUrl } from "../utils/catalogUtils";
import { FiAward, FiShield,FiX, FiFileText } from "react-icons/fi";

const API_BASE = "http://localhost:5000";

interface Catalog {
  id: number;
  name: string;
  filePath: string;
}

interface ProductDetail {
  id: number;
  slug: string; // Ürün slug'ı
  groupId: number;
  groupSlug: string; // Grup slug'ı
  title: string;
  description: string;
  imageUrl: string;
  standard: string;
  catalogs?: Catalog[];
}

const SubProductPage = () => {
  const { t, i18n } = useTranslation();
  const { groupSlug, productSlug } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Slug bazlı veri çekme
    fetch(
      `${API_BASE}/api/products/slug/${groupSlug}/${productSlug}?lang=${i18n.language}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("API'den gelen veri (slug):", data);
        console.log("Resim URL:", data.imageUrl);
        if (data.catalogs) {
          console.log("Kataloglar:", data.catalogs);
          data.catalogs.forEach((catalog: Catalog, index: number) => {
            console.log(`Katalog ${index + 1}:`, {
              name: catalog.name,
              filePath: catalog.filePath,
              finalUrl: getCatalogUrl(catalog.filePath)
            });
          });
        }
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ürün detay alınamadı (slug):", err);
        setLoading(false);
      });
  }, [groupSlug, productSlug, i18n.language]);

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#64748b',
          margin: 0
        }}>
          {t('loading.productInfo')}
        </p>
      </div>
    </div>
  );
  
  if (!product) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '20px'
        }}>
          😕
        </div>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '12px'
        }}>
          {t('error.productNotFound')}
        </h2>
        <p style={{
          color: '#6b7280',
          fontSize: '1.1rem'
        }}>
          {t('error.productNotFoundDesc')}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">


      {/* Hero Section - Modern Temiz Tasarım */}
      <section className="relative h-96 bg-gradient-to-r from-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{product.title}</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-300 mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Ana Ürün Detayları - Modern Temiz */}
      <section className="py-20 bg-white text-gray-800 relative">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Ürün Görseli - Modern Kart - SOLDA */}
            {product.imageUrl && (
              <div className="relative group">
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl p-2">
                  {imageLoading && (
                    <div className="w-full h-96 bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  <img
                    src={`${API_BASE}/${product.imageUrl.startsWith('/') ? product.imageUrl.slice(1) : product.imageUrl}`}
                    alt={product.title}
                    className={`w-full h-96 object-cover rounded-xl transition-all duration-700 group-hover:scale-105 ${
                      imageLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    loading="eager"
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                  />
                  
                  {/* Subtle Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-50/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            )}

            {/* Ürün Bilgileri - Modern - SAĞDA */}
            <div className="space-y-8">
              {/* Ana Başlık */}
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-poppins leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {product.title}
                  </span>
                </h2>
                
                {product.description && (
                  <p className="text-xl text-gray-600 leading-relaxed font-roboto border-l-4 border-blue-500 pl-4">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Ürün Özellikleri - Modern */}
              <div className="space-y-6">
                {/* Standard Bilgisi */}
                {product.standard && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 hover:border-blue-400 transition-all duration-300">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                        <FiAward className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Standard</h3>
                        <p className="text-blue-700 font-mono">
                          {product.standard}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Kataloglar - Etiket Tasarımı */}
              {product.catalogs && product.catalogs.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <FiFileText className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{t('pages.catalogs')}</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {product.catalogs.map((catalog) => (
                      <button
                        key={catalog.id}
                        onClick={() => {
                          setSelectedCatalog(catalog);
                          setShowPdfModal(true);
                        }}
                        className="group flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-300 transform hover:scale-105 hover:shadow-sm border border-blue-200 hover:border-blue-300 text-sm"
                      >
                        <FiFileText className="w-3 h-3 text-blue-600" />
                        <span className="font-medium">{catalog.name}</span>
                        <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          →
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500 italic">
                    {t('pages.catalogsDescription')}
                  </p>
                </div>
              )}

              {/* Contact Button - Modern */}
              <div className="pt-6">
                <button 
                  onClick={() => navigate('/contact')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                                      <div className="flex items-center justify-center">
                      <FiShield className="w-4 h-4 mr-2" />
                      {t('pages.contactUsButton')}
                    </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PDF Modal - Modern */}
      {showPdfModal && selectedCatalog && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPdfModal(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-2xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-poppins">
                  {selectedCatalog.name}
                </h3>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* PDF Content */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={`${getCatalogUrl(selectedCatalog.filePath)}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full"
                title={selectedCatalog.name}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubProductPage;
