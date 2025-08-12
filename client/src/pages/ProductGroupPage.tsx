import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCatalogUrl } from "../utils/catalogUtils";
import { FiChevronRight, FiDownload, FiX } from "react-icons/fi";

const API_BASE = "http://localhost:5000";

interface Catalog {
  id: number;
  name: string;
  filePath: string;
}

interface Product {
  id: number;
  slug: string; // Ürün slug'ı
  title: string;
  description: string;
  imageUrl: string;
  standard: string;
  catalogs?: Catalog[];
  key: string;
}

interface ProductGroup {
  id: number; // Grup ID'si
  slug: string; // SEO dostu URL slug'ı
  translation: {
    language: string; // Dil kodu
    name: string; // Grup adı (çeviri)
    description: string; // Grup açıklaması (çeviri)
  } | null; // Çeviri olmayabilir
  imageUrl: string; // Grup görseli
  standard: string; // Grup standardı
  products: Product[]; // Alt ürünler
}

const ProductGroupPage = () => {
  const { t, i18n } = useTranslation();
  const { groupSlug } = useParams();
  const navigate = useNavigate();
  const [groupData, setGroupData] = useState<ProductGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        // Slug bazlı veri çekme
        const groupRes = await fetch(`http://localhost:5000/api/product-groups?lang=${i18n.language}`);
        const groups = await groupRes.json();
        const currentGroup = groups.find((g: any) => g.slug === groupSlug);
        
        if (currentGroup) {
          // Slug ile alt ürünleri al
          const productsRes = await fetch(`http://localhost:5000/api/product-groups/slug/${groupSlug}/products?lang=${i18n.language}`);
          const products = await productsRes.json();
          
          setGroupData({
            id: currentGroup.id,
            slug: currentGroup.slug,
            translation: currentGroup.translation,
            imageUrl: currentGroup.imageUrl || '',
            standard: currentGroup.standard || '',
            products: products
          });
        } else {
          console.error("❌ Grup bulunamadı! groupSlug:", groupSlug);
        }
        setLoading(false);
      } catch (error) {
        console.error("❌ Grup verileri alınamadı:", error);
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupSlug, i18n.language]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-5"></div>
        <p className="text-lg text-gray-500">{t('loading.productInfo')}</p>
      </div>
    </div>
  );

  if (!groupData) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-6xl mb-5">😕</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t('error.categoryNotFound')}</h2>
        <p className="text-gray-600">{t('error.categoryNotFoundDesc')}</p>
      </div>
    </div>
  );

  // Eğer alt ürünler varsa, onları kartlar halinde göster
  if (groupData.products && groupData.products.length > 0) {
    return (
      <div className="w-full">
        {/* Hero Section - Full Width */}
        <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 lg:py-24">
          <div className="w-full px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Group Image */}
              {groupData.imageUrl && (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  {imageLoading && (
                    <div className="w-full h-80 lg:h-96 image-loading rounded-2xl"></div>
                  )}
                  <img
                    src={`${API_BASE}/${groupData.imageUrl.startsWith('/') ? groupData.imageUrl.slice(1) : groupData.imageUrl}`}
                    alt={groupData.translation?.name || "Product Group"} // Use the translated name for alt text, fallback to "Product Group" if not available
                    className={`w-full h-80 lg:h-96 object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                    style={{
                      imageRendering: '-webkit-optimize-contrast'
                    }}
                    loading="eager"
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                  />
                  {/* Removed overlay to preserve original image colors */}
                </div>
              )}

              {/* Group Info */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  {groupData.translation?.name}
                </h1>
                
                {groupData.translation?.description && (
                  <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                    {groupData.translation.description}
                  </p>
                )}

                {groupData.standard && (
                  <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                    <span className="text-white font-semibold">📋 Standard: {groupData.standard}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="w-full bg-white py-16">
          <div className="w-full px-4 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center flex items-center justify-center">
              <span className="bg-blue-100 text-blue-800 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </span>
              Alt Ürünler
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {groupData.products.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate(`/products/${groupData.slug}/${product.slug}`)}
                >
                  {/* Product Image */}
                  {product.imageUrl && (
                    <div className="h-56 overflow-hidden bg-gray-50 relative">
                      <img
                        src={`${API_BASE}/${product.imageUrl.startsWith('/') ? product.imageUrl.slice(1) : product.imageUrl}`}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        style={{
                          imageRendering: '-webkit-optimize-contrast'
                        }}
                        loading="lazy"
                      />
                      {/* Removed overlay to preserve original image colors */}
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {product.title}
                    </h3>

                    {product.description && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {product.description}
                      </p>
                    )}

                    {product.standard && (
                      <div className="inline-flex items-center bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                        {product.standard}
                      </div>
                    )}

                    {/* Catalogs */}
                    {product.catalogs && product.catalogs.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                          <FiDownload className="mr-1" /> Kataloglar
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {product.catalogs.map((catalog) => (
                            <div 
                              key={catalog.id} 
                              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCatalog(catalog);
                                setShowPdfModal(true);
                              }}
                            >
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                {catalog.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center text-blue-600 font-medium">
                      Detayları görüntüle
                      <FiChevronRight className="ml-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PDF Modal */}
        {showPdfModal && selectedCatalog && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setShowPdfModal(false)}
          >
            <div 
              className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col shadow-xl animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
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
  }

  // Eğer alt ürün yoksa, üst kategorinin kendisini göster
  return (
    <div className="w-full">
      {/* Hero Section - Full Width */}
      <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 lg:py-24">
        <div className="w-full px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Group Image */}
            {groupData.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={`${API_BASE}/${groupData.imageUrl.startsWith('/') ? groupData.imageUrl.slice(1) : groupData.imageUrl}`}
                  alt={groupData.translation?.name || "Product Group"} // Use the translated name for alt text, fallback to "Product Group" if not available
                  className="w-full h-80 lg:h-96 object-cover"
                />
                {/* Removed overlay to preserve original image colors */}
              </div>
            )}

            {/* Group Info */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {groupData.translation?.name}
              </h1>
              
              {groupData.translation?.description && (
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  {groupData.translation.description}
                </p>
              )}

              {groupData.standard && (
                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                  <span className="text-white font-semibold">📋 Standard: {groupData.standard}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGroupPage;