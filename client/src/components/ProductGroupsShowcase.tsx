// client/src/components/ProductGroupsShowcase.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ProductGroup {
  id: number;
  slug: string;
  title: string;
  description: string;
  imageUrl?: string;
  order: number;
  subcategories?: SubCategory[];
}

interface SubCategory {
  id: number;
  slug: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

interface ProductGroupsShowcaseProps {
  productGroups: ProductGroup[];
}

const ProductGroupsShowcase: React.FC<ProductGroupsShowcaseProps> = ({ productGroups }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // State'leri tanımlayalım
  const [selectedProductGroup, setSelectedProductGroup] = useState<ProductGroup | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all'); // Aktif filtre
  const [filteredCards, setFilteredCards] = useState<React.ReactElement[]>([]); // Filtrelenmiş kartlar

  // URL oluşturma yardımcı fonksiyonu
  const buildImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) return '';
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // URL'in başında / var mı kontrol et
    if (imageUrl.startsWith('/')) {
      return `http://localhost:5000${imageUrl}`;
    } else {
      return `http://localhost:5000/${imageUrl}`;
    }
  };

  // Ürün grubu seçimi
  const handleProductGroupClick = (productGroup: ProductGroup) => {
    setSelectedProductGroup(productGroup);
  };

  // Alt ürün detayına git - SubProductPage'e yönlendir
  const handleSubCategoryClick = (productGroup: ProductGroup, subCategory: SubCategory) => {
    navigate(`/products/${productGroup.slug}/${subCategory.slug}`);
  };

  // Ana ürün grubuna git - ProductGroupPage'e yönlendir
  const handleExploreClick = (productGroup: ProductGroup) => {
    navigate(`/products/${productGroup.slug}`);
  };

  // Ana kategori kartına tıklayınca ProductGroupPage'e git
  const handleMainCategoryClick = (productGroup: ProductGroup) => {
    navigate(`/products/${productGroup.slug}`);
  };

  // Filtreleme fonksiyonu
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setSelectedProductGroup(null); // Filtre değişince seçili ürünü temizle
  };

  // Tüm kartları oluştur (ana kategoriler + alt ürünler)
  const generateAllCards = () => {
                 const allCards: React.ReactElement[] = [];
                
    productGroups.forEach((productGroup) => {
      // Debug: Üst ürün resim bilgilerini logla
      console.log(`🔍 Ana Kategori: ${productGroup.title}`);
      console.log(`📸 Resim URL: ${productGroup.imageUrl}`);
      console.log(`🔗 Tam URL: ${buildImageUrl(productGroup.imageUrl)}`);
      
                  // Ana kategori kartı
                  allCards.push(
                    <div
                      key={`main-${productGroup.id}`}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border-2 border-gray-200 hover:border-gray-400"
                      onClick={() => handleMainCategoryClick(productGroup)}
                    >
                      {/* Resim */}
                      <div className="h-48 bg-gradient-to-br from-gray-500 to-gray-600 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                  {productGroup.imageUrl ? (
                    <img
                            src={buildImageUrl(productGroup.imageUrl)}
                      alt={productGroup.title}
                            className="w-full h-full object-cover rounded-t-lg transition-transform duration-500 hover:scale-110"
                            onLoad={() => console.log(`✅ Ana kategori resmi yüklendi: ${productGroup.title}`)}
                            onError={(e) => {
                              console.log(`❌ Ana kategori resmi yüklenemedi: ${productGroup.title}`);
                              console.log(`🔗 Hatalı URL: ${productGroup.imageUrl}`);
                              // Resim yüklenemezse fallback göster
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        
                        {/* Fallback - Resim yoksa veya yüklenemezse */}
                        <div 
                          className={`w-full h-full flex items-center justify-center ${productGroup.imageUrl ? 'hidden' : 'flex'}`}
                          style={{ display: productGroup.imageUrl ? 'none' : 'flex' }}
                        >
                          <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                              <span className="text-2xl text-white font-bold">{productGroup.title.charAt(0)}</span>
                    </div>
                            <span className="text-white text-sm font-medium">
                              {productGroup.imageUrl ? 'Resim Yüklenemedi' : 'Resim Yok'}
                            </span>
                  </div>
                        </div>
                </div>

                      {/* İçerik */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {productGroup.title}
                        </h3>
                        {productGroup.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {productGroup.description}
                          </p>
                        )}
                        
                        {/* Alt Kategori Sayısı */}
                  {productGroup.subcategories && productGroup.subcategories.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                              Alt Kategoriler
                            </p>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {productGroup.subcategories.length} alt ürün
                          </span>
                    </div>
                  )}

                        {/* CTA Button */}
                  <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium text-sm">
                            Ürün Grubunu Keşfet
                          </span>
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
                    </div>
                  );

                  // Alt ürünleri de ekle
                  if (productGroup.subcategories && productGroup.subcategories.length > 0) {
                    productGroup.subcategories.forEach((subCategory) => {
                      // Debug: Alt ürün resim bilgilerini logla
                      console.log(`🔍 Alt Ürün: ${subCategory.title}`);
                      console.log(`📸 Resim URL: ${subCategory.imageUrl}`);
                      
                      allCards.push(
                        <div
                          key={`sub-${subCategory.id}`}
                          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border-2 border-gray-200 hover:border-gray-400"
                          onClick={() => handleSubCategoryClick(productGroup, subCategory)}
                        >
                          {/* Resim */}
                          <div className="h-48 bg-gradient-to-br from-gray-500 to-gray-600 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                            {subCategory.imageUrl ? (
                              <img
                                src={buildImageUrl(subCategory.imageUrl)}
                                alt={subCategory.title}
                                className="w-full h-full object-cover rounded-t-lg transition-transform duration-500 hover:scale-110"
                                onLoad={() => console.log(`✅ Alt ürün resmi yüklendi: ${subCategory.title}`)}
                                onError={(e) => {
                                  console.log(`❌ Alt ürün resmi yüklenemedi: ${subCategory.title}`);
                                  // Resim yüklenemezse fallback göster
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            
                            {/* Fallback - Resim yoksa veya yüklenemezse */}
                            <div 
                              className={`w-full h-full flex items-center justify-center ${subCategory.imageUrl ? 'hidden' : 'flex'}`}
                              style={{ display: subCategory.imageUrl ? 'none' : 'flex' }}
                            >
                              <div className="text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                                  <span className="text-2xl text-white font-bold">{subCategory.title.charAt(0)}</span>
                                </div>
                                <span className="text-white text-sm font-medium">
                                  {subCategory.imageUrl ? 'Resim Yüklenemedi' : 'Resim Yok'}
                                </span>
                              </div>
                            </div>

                            {/* Ana Kategori Badge */}
                            <div className="absolute top-3 right-3 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              {productGroup.title}
                            </div>
                          </div>

                          {/* İçerik */}
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {subCategory.title}
                            </h3>
                            {subCategory.description && (
                              <p className="text-sm text-gray-600 mb-3">
                                {subCategory.description}
                              </p>
                            )}
                            
                            {/* Ana Kategori Bilgisi */}
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                                Ana Kategori
                              </p>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                {productGroup.title}
                              </span>
                            </div>
                            
                            {/* CTA Button */}
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 font-medium text-sm">
                                Alt Ürün Detayı
                              </span>
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  }
                });
                
                return allCards;
  };

  // Filtreleme işlemi
  const applyFilter = (cards: React.ReactElement[], filter: string) => {
    console.log(`🔍 Filtreleme başladı: ${filter}`);
    console.log(`📊 Toplam kart sayısı: ${cards.length}`);
    
    if (filter === 'all') {
      console.log(`✅ Tüm ürünler gösteriliyor: ${cards.length} kart`);
      return cards;
    }
    
    // Filtreye göre kartları filtrele
    const filteredCards = cards.filter(card => {
      const key = card.key as string;
      
      if (filter.startsWith('main-')) {
        // Ana kategori filtresi - ana kategori + alt ürünleri göster
        const productGroupId = filter.replace('main-', '');
        const productGroup = productGroups.find(group => group.id.toString() === productGroupId);
        
        if (!productGroup) {
          console.log(`❌ Ana kategori bulunamadı: ${productGroupId}`);
          return false;
        }
        
        console.log(`🔍 Ana kategori filtresi: ${productGroup.title} (ID: ${productGroupId})`);
        
        // Ana kategori kartı
        if (key === `main-${productGroupId}`) {
          console.log(`✅ Ana kategori kartı eklendi: ${key}`);
          return true;
        }
        
        // Alt ürün kartları - sadece bu ana kategoriye ait olanları
        if (key.startsWith('sub-')) {
          const subId = key.replace('sub-', '');
          const isSubOfThisGroup = productGroup.subcategories?.some(sub => sub.id.toString() === subId) || false;
          
          if (isSubOfThisGroup) {
            console.log(`✅ Alt ürün kartı eklendi: ${key} (${productGroup.title} altında)`);
          } else {
            console.log(`❌ Alt ürün kartı filtrelendi: ${key} (${productGroup.title} altında değil)`);
          }
          
          return isSubOfThisGroup;
        }
        
                      return false;
                  }
      
      return false;
    });
    
    console.log(`📊 Filtreleme sonucu: ${filteredCards.length} kart`);
    return filteredCards;
  };

  // Filtre seçeneklerini oluştur
  const generateFilterOptions = () => {
    console.log('🔧 Filtre seçenekleri oluşturuluyor...');
    console.log(`📊 Toplam ürün grubu sayısı: ${productGroups.length}`);
    
    const options = [
      { key: 'all', label: 'Tüm Ürünler', count: productGroups.length + productGroups.reduce((acc, group) => acc + (group.subcategories?.length || 0), 0) }
    ];
    
    // Sadece ana kategoriler - alt ürünler ayrı ayrı listelenmesin
    productGroups.forEach(group => {
      const subCount = group.subcategories?.length || 0;
      const option = {
        key: `main-${group.id}`,
        label: group.title,
        count: 1 + subCount // Ana kategori + alt ürünler
      };
      options.push(option);
      console.log(`🔧 Ana kategori filtresi eklendi: ${option.label} (${option.count} ürün)`);
    });
    
    console.log(`🔧 Toplam ${options.length} filtre seçeneği oluşturuldu`);
    return options;
  };

  useEffect(() => {
    console.log('🔄 ProductGroupsShowcase - productGroups updated:', productGroups);
    
    // Tüm kartları oluştur ve filtrele
    const allCards = generateAllCards();
    const filtered = applyFilter(allCards, activeFilter);
    setFilteredCards(filtered);
  }, [productGroups, activeFilter]);

  if (!productGroups || productGroups.length === 0) {
    return null;
  }

  const filterOptions = generateFilterOptions();

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tüm Ürünlerimiz
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Kaliteli ve güvenilir ürünlerimizi keşfedin.
          </p>
                      </div>
                      
        {/* Filtreleme Tab'ları */}
        <div className="mb-12">
          {/* Filtre Seçenekleri */}
          <div className="flex flex-wrap justify-center gap-3">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => handleFilterChange(option.key)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                  activeFilter === option.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-md'
                }`}
              >
                <span className="text-sm">
                  {option.label}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeFilter === option.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {option.count}
                        </span>
              </button>
            ))}
                      </div>
                    </div>

                {/* Tüm Ürünler Grid - Ana kategoriler ve alt ürünler karışık */}
        <div className="mb-16">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards}
          </div>
        </div>

        {/* Seçili Ürün Grubu Detayı */}
        {selectedProductGroup && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sol - Resim */}
              <div className="h-64 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {selectedProductGroup.imageUrl ? (
                    <img
                    src={buildImageUrl(selectedProductGroup.imageUrl)}
                      alt={selectedProductGroup.title}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      console.log(`❌ Seçili ürün resmi yüklenemedi: ${selectedProductGroup.title}`);
                      // Resim yüklenemezse fallback göster
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* Fallback - Resim yoksa veya yüklenemezse */}
                <div 
                  className={`w-full h-full flex items-center justify-center ${selectedProductGroup.imageUrl ? 'hidden' : 'flex'}`}
                  style={{ display: selectedProductGroup.imageUrl ? 'none' : 'flex' }}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl text-white font-bold">{selectedProductGroup.title.charAt(0)}</span>
                    </div>
                    <span className="text-white text-sm font-medium">
                      {selectedProductGroup.imageUrl ? 'Resim Yüklenemedi' : 'Resim Yok'}
                    </span>
                  </div>
                </div>


              </div>

              {/* Sağ - İçerik */}
                <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {selectedProductGroup.title}
                  </h3>
                <p className="text-gray-600 mb-6">
                  {selectedProductGroup.description || 'Ürün açıklaması bulunmuyor'}
                  </p>
                  
                {/* Alt kategoriler */}
                  {selectedProductGroup.subcategories && selectedProductGroup.subcategories.length > 0 && (
                    <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Alt Kategoriler</h4>
                      <div className="space-y-2">
                        {selectedProductGroup.subcategories.map((sub) => (
                          <div
                            key={sub.id}
                          className="p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer border border-green-200"
                            onClick={() => handleSubCategoryClick(selectedProductGroup, sub)}
                          >
                          <h5 className="font-medium text-gray-900">{sub.title}</h5>
                              {sub.description && (
                            <p className="text-sm text-gray-600">{sub.description}</p>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                {/* Keşfet butonu */}
                  <button
                    onClick={() => handleExploreClick(selectedProductGroup)}
                   className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                   Ürün Grubunu Keşfet
                  </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGroupsShowcase;
