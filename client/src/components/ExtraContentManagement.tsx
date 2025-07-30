import React, { useState, useEffect } from 'react';
import SolutionExtraContentAdder from './SolutionExtraContentAdder';

interface ExtraContent {
  id: number;
  type: string;
  title: string;
  content: string;
  order: number;
  language: string;
  solutionId: number;
  solutionTitle: string;
}

interface Solution {
  id: number;
  slug: string;
  title: string;
  hasExtraContent: boolean;
}

interface GroupedContent {
  solution: Solution;
  contents: ExtraContent[];
}

const ExtraContentManagement: React.FC = () => {
  const [extraContents, setExtraContents] = useState<ExtraContent[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [groupedContents, setGroupedContents] = useState<GroupedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdder, setShowAdder] = useState(false);
  const [editingContent, setEditingContent] = useState<ExtraContent | null>(null);
  const [expandedSolutions, setExpandedSolutions] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // İçerikleri solution'lara göre grupla
    const grouped = solutions.map(solution => {
      const solutionContents = extraContents.filter(content => content.solutionId === solution.id);
      return {
        solution,
        contents: solutionContents
      };
    }).filter(group => group.contents.length > 0); // Sadece içeriği olan solution'ları göster

    setGroupedContents(grouped);
  }, [extraContents, solutions]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Ekstra içerikleri ve solution'ları paralel olarak çek
      const [contentsResponse, solutionsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/solution-extra-content/admin'),
        fetch('http://localhost:5000/api/solutions/admin')
      ]);
      
      if (!contentsResponse.ok || !solutionsResponse.ok) {
        throw new Error('Data fetch failed');
      }

      const [contentsData, solutionsData] = await Promise.all([
        contentsResponse.json(),
        solutionsResponse.json()
      ]);

      setExtraContents(contentsData);
      setSolutions(solutionsData);
    } catch (err) {
      setMessage({ type: 'error', text: 'Veriler yüklenirken hata oluştu' });
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSolutionExpansion = (solutionId: number) => {
    const newExpanded = new Set(expandedSolutions);
    if (newExpanded.has(solutionId)) {
      newExpanded.delete(solutionId);
    } else {
      newExpanded.add(solutionId);
    }
    setExpandedSolutions(newExpanded);
  };

  const handleDeleteContent = async (id: number) => {
    if (!confirm('Bu ekstra içeriği silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/solution-extra-content/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ekstra içerik silinirken hata oluştu');
      }

      setMessage({ type: 'success', text: 'Ekstra içerik başarıyla silindi!' });
      fetchData(); // Listeyi yenile
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu' 
      });
    }
  };

  const handleEditContent = (content: ExtraContent) => {
    setEditingContent(content);
    setShowAdder(true);
  };

  const handleContentAdded = () => {
    setMessage({ type: 'success', text: 'Ekstra içerik başarıyla eklendi!' });
    setShowAdder(false);
    setEditingContent(null);
    fetchData(); // Listeyi yenile
  };

  const handleCancelAdder = () => {
    setShowAdder(false);
    setEditingContent(null);
    setMessage(null);
  };

  const getContentPreview = (content: ExtraContent) => {
    try {
      if (content.type === 'mixed') {
        // HTML içeriği için basit preview
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content.content;
        return tempDiv.textContent?.substring(0, 100) + '...' || 'HTML içerik';
      } else if (content.type === 'text') {
        // JSON string'den text çıkar
        const textData = JSON.parse(content.content);
        return textData.substring(0, 100) + '...';
      } else if (content.type === 'table') {
        // JSON string'den tablo verisi çıkar
        const tableData = JSON.parse(content.content);
        return `Tablo: ${tableData.headers?.join(', ') || 'Veri yok'}`;
      } else if (content.type === 'list') {
        // JSON string'den liste verisi çıkar
        const listData = JSON.parse(content.content);
        return `Liste: ${listData.items?.join(', ') || 'Veri yok'}`;
      }
      return 'Bilinmeyen içerik türü';
    } catch (error) {
      return 'İçerik önizlenemiyor';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Metin';
      case 'table': return 'Tablo';
      case 'list': return 'Liste';
      case 'mixed': return 'Karışık';
      default: return type;
    }
  };

  const getLanguageName = (code: string) => {
    const names = { tr: 'Türkçe', en: 'İngilizce', de: 'Almanca', fr: 'Fransızca' };
    return names[code as keyof typeof names] || code;
  };

  const getLanguageFlag = (code: string) => {
    const flags = { tr: '🇹🇷', en: '🇬🇧', de: '🇩🇪', fr: '🇫🇷' };
    return flags[code as keyof typeof flags] || code;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Veriler yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="extra-content-management">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Ekstra İçerik Yönetimi</h2>
        <button
          onClick={() => setShowAdder(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          ➕ Yeni İçerik Ekle
        </button>
      </div>

      {/* Mesaj */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* İçerik Ekleme Formu */}
      {showAdder && (
        <div className="mb-8">
          <SolutionExtraContentAdder 
            onContentAdded={handleContentAdded}
            onCancel={handleCancelAdder}
            editingContent={editingContent}
          />
        </div>
      )}

      {/* Solution Bazlı İçerik Listesi */}
      {!showAdder && (
        <div className="space-y-6">
          {groupedContents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold mb-2">Henüz Ekstra İçerik Yok</h3>
                <p>İlk ekstra içeriğinizi eklemek için "Yeni İçerik Ekle" butonuna tıklayın.</p>
              </div>
            </div>
          ) : (
            groupedContents.map((group) => (
              <div key={group.solution.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Solution Header */}
                <div 
                  className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                  onClick={() => toggleSolutionExpansion(group.solution.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {group.solution.title}
                      </h3>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {group.contents.length} içerik
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {expandedSolutions.has(group.solution.id) ? 'Gizle' : 'Göster'}
                      </span>
                      <svg 
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          expandedSolutions.has(group.solution.id) ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Solution Content */}
                {expandedSolutions.has(group.solution.id) && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Dil bazlı blog'lar */}
                      {['tr', 'en', 'de', 'fr'].map((language) => {
                        const languageContents = group.contents.filter(content => content.language === language);
                        
                        return (
                          <div key={language} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-lg">{getLanguageFlag(language)}</span>
                              <h4 className="font-medium text-gray-900">{getLanguageName(language)}</h4>
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                {languageContents.length}
                              </span>
                            </div>
                            
                            {languageContents.length === 0 ? (
                              <div className="text-center py-4 text-gray-400">
                                <div className="text-2xl mb-2">📝</div>
                                <p className="text-sm">İçerik yok</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {languageContents.map((content) => (
                                  <div key={content.id} className="bg-white rounded border border-gray-200 p-3">
                                    <div className="flex items-start justify-between mb-2">
                                      <h5 className="font-medium text-sm text-gray-900 truncate">
                                        {content.title}
                                      </h5>
                                      <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                        {getTypeLabel(content.type)}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                      {getContentPreview(content)}
                                    </p>
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditContent(content);
                                        }}
                                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                      >
                                        Düzenle
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteContent(content.id);
                                        }}
                                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                      >
                                        Sil
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ExtraContentManagement;