import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface Solution {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  extraContents: ExtraContent[];
}

interface ExtraContent {
  id: number;
  type: string;
  title: string;
  content: string;
  order: number;
}

const SolutionPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolution = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/solutions/${slug}?lang=tr`);
        
        if (!response.ok) {
          throw new Error('Solution bulunamadı');
        }

        const data: Solution = await response.json();
        setSolution(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchSolution();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !solution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Hata</h1>
          <p className="text-gray-600">{error || 'Solution bulunamadı'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{solution.title}</h1>
            <p className="text-xl md:text-2xl opacity-90">{solution.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="space-y-6">
            <img
              src={`http://localhost:5000${solution.imageUrl}`}
              alt={solution.title}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Description */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{solution.title}</h2>
              <p className="text-xl text-gray-600 mb-6">{solution.subtitle}</p>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {solution.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Extra Contents */}
        {solution.extraContents && solution.extraContents.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Ek İçerikler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solution.extraContents.map((content) => (
                <div
                  key={content.id}
                  className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {content.title}
                  </h4>
                  <div className="prose prose-sm max-w-none">
                    <div 
                      className="text-gray-700"
                      dangerouslySetInnerHTML={{ __html: content.content }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Bu çözüm hakkında daha fazla bilgi almak ister misiniz?
            </h3>
            <p className="text-gray-600 mb-6">
              Uzman ekibimiz size yardımcı olmaktan mutluluk duyacaktır.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                İletişime Geçin
              </button>
              <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                Teklif Alın
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionPage;