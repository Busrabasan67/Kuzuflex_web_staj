import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCatalogUrl } from "../utils/catalogUtils";
import { FiX, FiArrowRight, FiAward,  FiShield } from "react-icons/fi";

const API_BASE = "http://localhost:5000";

interface Catalog {
  id: number;
  name: string;
  filePath: string;
}

interface Product {
  id: number;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  standard: string;
  catalogs?: Catalog[];
  key: string;
}

interface ProductGroup {
  id: number;
  slug: string;
  translation: {
    language: string;
    name: string;
    description: string;
  } | null;
  imageUrl: string;
  standard: string;
  products: Product[];
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
        const groupRes = await fetch(`http://localhost:5000/api/product-groups?lang=${i18n.language}`);
        const groups = await groupRes.json();
        const currentGroup = groups.find((g: any) => g.slug === groupSlug);
        
        if (currentGroup) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-500 font-roboto">{t('loading.productInfo')}</p>
      </div>
    </div>
  );

  if (!groupData) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-5">😕</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3 font-poppins">{t('error.categoryNotFound')}</h2>
        <p className="text-gray-600 font-roboto">{t('error.categoryNotFoundDesc')}</p>
      </div>
    </div>
  );

  // Eğer alt ürünler varsa, onları kartlar halinde göster
  if (groupData.products && groupData.products.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">


        {/* Hero Section - Modern Temiz Tasarım */}
        <section className="relative h-96 bg-gradient-to-r from-blue-600 to-blue-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{groupData.translation?.name}</h1>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-300 mx-auto rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Ana Ürün Grubu Bilgileri - Modern Temiz */}
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
              {/* Ana Ürün Grubu Görseli - Modern Kart - SOLDA */}
              {groupData.imageUrl && (
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl p-2">
                    <img
                      src={`${API_BASE}/${groupData.imageUrl.startsWith('/') ? groupData.imageUrl.slice(1) : groupData.imageUrl}`}
                      alt={groupData.translation?.name || "Product Group"}
                      className="w-full h-96 object-cover rounded-xl transition-all duration-700 group-hover:scale-105"
                    />
                    
                    {/* Subtle Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-50/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              )}

              {/* Ürün Grubu Bilgileri - Modern - SAĞDA */}
              <div className="space-y-8">
                {/* Ana Başlık */}
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-poppins leading-tight">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {groupData.translation?.name}
                    </span>
                  </h2>
                  
                  {groupData.translation?.description && (
                    <p className="text-xl text-gray-600 leading-relaxed font-roboto border-l-4 border-blue-500 pl-4">
                      {groupData.translation.description}
                    </p>
                  )}
                </div>

                {/* Ürün Grubu Özellikleri - Modern */}
                <div className="space-y-6">
                  {/* Standard Bilgisi */}
                  {groupData.standard && groupData.standard !== 'null' && groupData.standard.trim() !== '' && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 hover:border-blue-400 transition-all duration-300">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                          <FiAward className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">Standard</h3>
                          <p className="text-blue-700 font-mono">
                            {groupData.standard}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

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

        {/* Alt Ürünler Listesi - Kart Şeklinde */}
        <section id="products-section" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-poppins">
                {t('pages.ourProducts')}
              </h2>
            </div>
            
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {groupData.products.map((product, index) => (
                <div 
                  key={product.id} 
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer transform"
                  onClick={() => navigate(`/products/${groupData.slug}/${product.slug}`)}
                >
                  {/* Product Image */}
                  {product.imageUrl && (
                    <div className="h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">
                      <img
                        src={`${API_BASE}/${product.imageUrl.startsWith('/') ? product.imageUrl.slice(1) : product.imageUrl}`}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        style={{ imageRendering: '-webkit-optimize-contrast' }}
                        loading="lazy"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      

                    </div>
                  )}

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300 font-poppins leading-tight">
                      {product.title}
                    </h3>

                    {product.description && (
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-2 font-roboto">
                        {product.description}
                      </p>
                    )}

                    {product.standard && (
                      <div className="inline-flex items-center bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium mb-4">
                        <FiAward className="w-4 h-4 mr-2" />
                        {product.standard}
                      </div>
                    )}

                    {/* CTA Butonu */}
                    <button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg group-hover:shadow-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/products/${groupData.slug}/${product.slug}`);
                      }}
                    >
                      <div className="flex items-center justify-center">
                        <span>{t('pages.exploreButton')}</span>
                        <FiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PDF Modal */}
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
  }

  // Eğer alt ürün yoksa, üst kategorinin kendisini göster
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">


      {/* Hero Section - Endüstriyel Tasarım */}
      <section className="relative h-96 bg-gradient-to-r from-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{groupData.translation?.name}</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-300 mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Ana Ürün Grubu Bilgileri - Endüstriyel Tasarım */}
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
            {/* Ana Ürün Grubu Görseli - Modern Kart - SOLDA */}
            {groupData.imageUrl && (
              <div className="relative group">
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl p-2">
                  <img
                    src={`${API_BASE}/${groupData.imageUrl.startsWith('/') ? groupData.imageUrl.slice(1) : groupData.imageUrl}`}
                    alt={groupData.translation?.name || "Product Group"}
                    className="w-full h-96 object-cover rounded-xl transition-all duration-700 group-hover:scale-105"
                  />
                  
                  {/* Subtle Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-50/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            )}

            {/* Ürün Grubu Bilgileri - Modern - SAĞDA */}
            <div className="space-y-8">
              {/* Ana Başlık */}
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-poppins leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {groupData.translation?.name}
                  </span>
                </h2>
                
                {groupData.translation?.description && (
                  <p className="text-xl text-gray-600 leading-relaxed font-roboto border-l-4 border-blue-500 pl-4">
                    {groupData.translation.description}
                  </p>
                )}
              </div>

              {/* Ürün Grubu Özellikleri - Modern */}
              <div className="space-y-6">
                {/* Standard Bilgisi */}
                {groupData.standard && groupData.standard !== 'null' && groupData.standard.trim() !== '' && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 hover:border-blue-400 transition-all duration-300">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                        <FiAward className="w-6 h-6 text-white" />
                      </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">Standard</h3>
                          <p className="text-blue-700 font-mono">
                            {groupData.standard}
                          </p>
                        </div>
                    </div>
                  </div>
                )}
              </div>

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
    </div>
  );
};

export default ProductGroupPage;