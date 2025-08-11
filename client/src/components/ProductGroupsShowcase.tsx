// client/src/components/ProductGroupsShowcase.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ProductGroup {
  id: number;
  slug: string;
  title: string;
  description: string;
  imageUrl?: string;
  order: number;
}

interface ProductGroupsShowcaseProps {
  productGroups: ProductGroup[];
}

const ProductGroupsShowcase: React.FC<ProductGroupsShowcaseProps> = ({ productGroups }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleProductGroupClick = (productGroup: ProductGroup) => {
    navigate(`/products/${productGroup.slug}`);
  };

  if (!productGroups || productGroups.length === 0) {
    return null;
  }

  return (
    <section className="py-20 text-white relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M50 50c0 27.614-22.386 50-50 50s-50-22.386-50-50 22.386-50 50-50 50 22.386 50 50zm0-50c0-27.614-22.386-50-50-50s-50 22.386-50 50 22.386 50 50 50 50-22.386 50-50z'/%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              {t('home.productGroups.title', 'PRODUCT GROUPS')}
            </span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {t('home.productGroups.subtitle', 'Comprehensive range of high-quality flexible metal products')}
          </p>
        </div>

        {/* Product Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {productGroups.map((productGroup, index) => (
            <div
              key={productGroup.id}
              className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-white/20 hover:border-white/40"
              onClick={() => handleProductGroupClick(productGroup)}
            >
              {/* Icon/Image */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {productGroup.imageUrl ? (
                  <img
                    src={productGroup.imageUrl.startsWith('http') ? productGroup.imageUrl : `http://localhost:5000${productGroup.imageUrl}`}
                    alt={productGroup.title}
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">{productGroup.title.charAt(0)}</span>
                )}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300">
                {productGroup.title}
              </h3>
              <p className="text-blue-100 text-sm leading-relaxed mb-4">
                {productGroup.description || t('home.productGroups.defaultDescription', 'High-quality flexible metal products')}
              </p>

              {/* CTA */}
              <div className="flex items-center justify-between">
                <span className="text-cyan-300 font-semibold text-sm group-hover:text-cyan-200 transition-colors duration-300">
                  {t('home.productGroups.exploreButton', 'Keşfet')}
                </span>
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center group-hover:bg-cyan-500/40 transition-colors duration-300">
                  <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Quality Banner */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 text-center border border-white/20">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('home.productGroups.qualitySlogan', 'QUALITÉ NEVER NE VIENT JAMAIS PAR HASARD')}
          </h3>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            {t('home.productGroups.qualityDescription', 'PRODUITS FLEXIBLES À HAUTE ENDURANCE ET FLEXIBLES CERTIFIÉS')}
          </p>
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            {t('home.productGroups.viewAll', 'Tüm Ürün Gruplarını Gör')}
          </button>
        </div>
      </div>
      </div>
    </section>
  );
};

export default ProductGroupsShowcase;
