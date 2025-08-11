// client/src/components/SolutionsHighlight.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Solution {
  id: number;
  slug: string;
  title: string;
  description: string;
  imageUrl?: string;
  order: number;
}

interface SolutionsHighlightProps {
  solutions: Solution[];
}

const SolutionsHighlight: React.FC<SolutionsHighlightProps> = ({ solutions }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeSolution, setActiveSolution] = useState<Solution | null>(solutions[0] || null);

  const handleSolutionClick = (solution: Solution) => {
    setActiveSolution(solution);
  };

  const handleExploreClick = (solution: Solution) => {
    navigate(`/solutions/${solution.slug}`);
  };

  if (!solutions || solutions.length === 0) {
    return null;
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {t('home.solutions.title', 'SOLUTIONS')}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('home.solutions.subtitle', 'Cutting-edge solutions that drive innovation and efficiency')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Solutions List */}
          <div className="space-y-4">
            {solutions.map((solution, index) => (
              <div
                key={solution.id}
                className={`group cursor-pointer p-6 rounded-2xl transition-all duration-300 ${
                  activeSolution?.id === solution.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-xl transform scale-105'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:scale-102'
                }`}
                onClick={() => handleSolutionClick(solution)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      activeSolution?.id === solution.id
                        ? 'bg-white/20'
                        : 'bg-blue-100 group-hover:bg-blue-200'
                    }`}>
                      <span className={`text-xl font-bold ${
                        activeSolution?.id === solution.id
                          ? 'text-white'
                          : 'text-blue-600'
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div>
                      <h3 className={`text-lg font-semibold mb-1 ${
                        activeSolution?.id === solution.id
                          ? 'text-white'
                          : 'text-gray-900'
                      }`}>
                        {solution.title}
                      </h3>
                      <p className={`text-sm ${
                        activeSolution?.id === solution.id
                          ? 'text-blue-100'
                          : 'text-gray-600'
                      }`}>
                        {solution.description || t('home.solutions.defaultDescription', 'Innovative solution')}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className={`transition-transform duration-300 ${
                    activeSolution?.id === solution.id
                      ? 'rotate-90 text-white'
                      : 'text-gray-400 group-hover:text-blue-500'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - Active Solution Display */}
          <div className="relative">
            {activeSolution && (
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 shadow-xl">
                {/* Image */}
                <div className="relative h-64 rounded-2xl overflow-hidden mb-6">
                  {activeSolution.imageUrl ? (
                    <img
                      src={activeSolution.imageUrl.startsWith('http') ? activeSolution.imageUrl : `http://localhost:5000${activeSolution.imageUrl}`}
                      alt={activeSolution.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                      <span className="text-white text-6xl font-bold">{activeSolution.title.charAt(0)}</span>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  
                  {/* Order Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                    #{activeSolution.order}
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {activeSolution.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {activeSolution.description || t('home.solutions.defaultDescription', 'Innovative solution')}
                  </p>
                  
                  {/* CTA Button */}
                  <button
                    onClick={() => handleExploreClick(activeSolution)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {t('home.solutions.exploreButton', 'Keşfet')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View All Solutions Button */}
        <div className="text-center mt-16">
          <button className="border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105">
            {t('home.solutions.viewAll', 'Tüm Çözümleri Gör')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default SolutionsHighlight;
