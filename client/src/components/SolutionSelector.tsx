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
      <h3 className="text-lg font-semibold mb-4">Hangi Solution'a İçerik Eklemek İstiyorsunuz?</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {solutions.map((solution) => (
          <div
            key={solution.id}
            onClick={() => handleSolutionSelect(solution)}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedSolution?.id === solution.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{solution.title}</h4>
              {solution.hasExtraContent && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  İçerik Var
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">Slug: {solution.slug}</p>
            <p className="text-xs text-gray-500 mt-1">
              {solution.hasExtraContent 
                ? 'Bu solution\'da zaten ekstra içerik var' 
                : 'Bu solution\'da henüz ekstra içerik yok'
              }
            </p>
          </div>
        ))}
      </div>

      {selectedSolution && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            Seçilen Solution: {selectedSolution.title}
          </h4>
          <p className="text-sm text-blue-700">
            Bu solution'a yeni içerik ekleyebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
};

export default SolutionSelector;