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
      <div className="flex items-center justify-center p-6 text-sm text-gray-600">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
        Solution'lar yükleniyor...
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
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Solution Seçimi</h2>
      </div>

      {/* Search and Filter */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Solution ara..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Solutions List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {solutions.map((solution) => (
          <div
            key={solution.id}
            onClick={() => handleSolutionSelect(solution)}
            className={`group relative p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
              selectedSolution?.id === solution.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${selectedSolution?.id === solution.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className={`font-medium ${selectedSolution?.id === solution.id ? 'text-blue-900' : 'text-gray-900'}`}>{solution.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${solution.hasExtraContent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {solution.hasExtraContent ? 'İçerik Var' : 'Yeni'}
                </span>
                {selectedSolution?.id === solution.id && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Solution Summary - minimal görünümde gizli */}
    </div>
  );
};

export default SolutionSelector;