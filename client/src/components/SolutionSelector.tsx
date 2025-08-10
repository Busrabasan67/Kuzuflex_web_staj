import React, { useState, useEffect } from 'react';

interface Solution {
  id: number;
  slug: string;
  title: string;
  hasExtraContent: boolean;
}

interface SolutionSelectorProps {
  onSolutionSelect: (solution: Solution) => void;
}

const SolutionSelector: React.FC<SolutionSelectorProps> = ({ onSolutionSelect }) => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/solutions/admin');
      
      if (!response.ok) {
        throw new Error('Solutions fetch failed');
      }

      const data = await response.json();
      setSolutions(data);
    } catch (err) {
      setError('Solution\'lar yüklenirken hata oluştu');
      console.error('Error fetching solutions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSolutionSelect = (solution: Solution) => {
    setSelectedSolution(solution);
    onSolutionSelect(solution);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Solution'lar yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchSolutions}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="solution-selector">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Solution Seçimi
        </h2>
        <p className="text-gray-600">
          Hangi solution'a ekstra içerik eklemek istiyorsunuz?
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Solution ara..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Solutions List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {solutions.map((solution) => (
          <div
            key={solution.id}
            onClick={() => handleSolutionSelect(solution)}
            className={`group relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
              selectedSolution?.id === solution.id
                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Solution Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedSolution?.id === solution.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>

                {/* Solution Info */}
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg ${
                    selectedSolution?.id === solution.id ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {solution.title}
                  </h3>
                  <p className="text-sm text-gray-500">ID: #{solution.id} • Slug: {solution.slug}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center space-x-2">
                {solution.hasExtraContent ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    İçerik Var
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Boş
                  </span>
                )}

                {/* Selection Indicator */}
                {selectedSolution?.id === solution.id && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-3 pl-16">
              <p className="text-sm text-gray-600">
                {solution.hasExtraContent 
                  ? 'Bu solution\'da zaten ekstra içerik bulunuyor. Mevcut içeriği düzenleyebilir veya yeni içerik ekleyebilirsiniz.'
                  : 'Bu solution\'da henüz ekstra içerik yok. İlk içeriğinizi ekleyerek başlayabilirsiniz.'
                }
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Solution Summary */}
      {selectedSolution && (
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 text-lg">
                Seçilen Solution: {selectedSolution.title}
              </h4>
              <p className="text-blue-700">
                Bu solution'a yeni içerik eklemeye hazırsınız. Devam etmek için bir sonraki adıma geçebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolutionSelector;