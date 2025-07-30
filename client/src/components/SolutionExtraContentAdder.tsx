import React, { useState, useEffect } from 'react';
import SolutionSelector from './SolutionSelector';
import ContentTypeSelector from './ContentTypeSelector';
import SimpleTableBuilder from './SimpleTableBuilder';
import SimpleListBuilder from './SimpleListBuilder';
import MixedContentEditor from './MixedContentEditor';
import { generateMixedContentHTML } from '../utils/htmlGenerators';

// Local type definitions as backup
interface ContentElement {
  id: string;
  type: 'text' | 'image' | 'table' | 'list';
  content: any;
  position?: 'left' | 'right' | 'full';
  width?: '25%' | '50%' | '75%' | '100%';
}

// ContentType'ı burada da tanımla (backup olarak)
type ContentType = 'text' | 'table' | 'list' | 'mixed';

interface Solution {
  id: number;
  slug: string;
  title: string;
  hasExtraContent: boolean;
}

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

interface TableData {
  headers: string[];
  rows: string[][];
}

interface ListData {
  items: string[];
  type: 'ordered' | 'unordered';
}

// Çoklu dil için yeni interface
interface MultiLanguageContent {
  tr: { title: string; content: any };
  en: { title: string; content: any };
  de: { title: string; content: any };
  fr: { title: string; content: any };
}

interface SolutionExtraContentAdderProps {
  onContentAdded?: () => void;
  onCancel?: () => void;
  editingContent?: ExtraContent | null;
}

const SolutionExtraContentAdder: React.FC<SolutionExtraContentAdderProps> = ({ 
  onContentAdded,
  onCancel,
  editingContent = null
}) => {
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [multiLanguageContent, setMultiLanguageContent] = useState<MultiLanguageContent>({
    tr: { title: '', content: null },
    en: { title: '', content: null },
    de: { title: '', content: null },
    fr: { title: '', content: null }
  });
  const [mixedElements, setMixedElements] = useState<ContentElement[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Düzenleme modu için başlangıç verilerini yükle
  useEffect(() => {
    if (editingContent) {
      // Mevcut içeriği yükle
      setSelectedType(editingContent.type as ContentType);
      
      // Solution'ı bul ve seç
      fetchSolutionForEditing(editingContent.solutionId);
      
      // İçeriği parse et
      if (editingContent.type === 'mixed') {
        // HTML içeriğini parse et (basit bir yaklaşım)
        setMixedElements([]); // Şimdilik boş, daha gelişmiş parser gerekebilir
      } else {
        try {
          const parsedContent = JSON.parse(editingContent.content);
          // Sadece mevcut dil için içerik yükle
          setMultiLanguageContent(prev => ({
            ...prev,
            [editingContent.language]: {
              title: editingContent.title,
              content: parsedContent
            }
          }));
        } catch (error) {
          console.error('Content parsing error:', error);
        }
      }
    }
  }, [editingContent]);

  const fetchSolutionForEditing = async (solutionId: number) => {
    try {
      const response = await fetch('http://localhost:5000/api/solutions/admin');
      if (response.ok) {
        const solutions = await response.json();
        const solution = solutions.find((s: Solution) => s.id === solutionId);
        if (solution) {
          setSelectedSolution(solution);
        }
      }
    } catch (error) {
      console.error('Error fetching solution for editing:', error);
    }
  };

  const handleSolutionSelect = (solution: Solution) => {
    setSelectedSolution(solution);
    if (!editingContent) {
      setSelectedType(null);
      setMultiLanguageContent({
        tr: { title: '', content: null },
        en: { title: '', content: null },
        de: { title: '', content: null },
        fr: { title: '', content: null }
      });
      setMixedElements([]);
    }
    setMessage(null);
  };

  const handleTypeSelect = (type: ContentType) => {
    setSelectedType(type);
    if (type === 'mixed') {
      setMixedElements([]);
    } else {
      // Her dil için varsayılan içerik oluştur
      const defaultContent = getDefaultContent(type);
      setMultiLanguageContent({
        tr: { title: '', content: defaultContent },
        en: { title: '', content: defaultContent },
        de: { title: '', content: defaultContent },
        fr: { title: '', content: defaultContent }
      });
    }
    setMessage(null);
  };

  const getDefaultContent = (type: ContentType) => {
    switch (type) {
      case 'text':
        return '';
      case 'table':
        return { headers: ['Başlık 1', 'Başlık 2'], rows: [['Veri 1', 'Veri 2']] };
      case 'list':
        return { items: ['Madde 1', 'Madde 2'], type: 'unordered' };
      default:
        return null;
    }
  };

  const handleContentChange = (language: string, newContent: any) => {
    setMultiLanguageContent(prev => ({
      ...prev,
      [language]: {
        ...prev[language as keyof MultiLanguageContent],
        content: newContent
      }
    }));
  };

  const handleTitleChange = (language: string, newTitle: string) => {
    setMultiLanguageContent(prev => ({
      ...prev,
      [language]: {
        ...prev[language as keyof MultiLanguageContent],
        title: newTitle
      }
    }));
  };

  const validateForm = () => {
    const languages = ['tr', 'en', 'de', 'fr'];
    
    for (const lang of languages) {
      const content = multiLanguageContent[lang as keyof MultiLanguageContent];
      if (!content.title.trim()) {
        setMessage({ type: 'error', text: `${getLanguageName(lang)} dili için başlık zorunludur!` });
        return false;
      }
      
      if (selectedType !== 'mixed') {
        if (selectedType === 'text' && !content.content?.trim()) {
          setMessage({ type: 'error', text: `${getLanguageName(lang)} dili için içerik zorunludur!` });
          return false;
        }
        if (selectedType === 'table' && (!content.content?.headers || content.content.headers.length === 0)) {
          setMessage({ type: 'error', text: `${getLanguageName(lang)} dili için tablo başlıkları zorunludur!` });
          return false;
        }
        if (selectedType === 'list' && (!content.content?.items || content.content.items.length === 0)) {
          setMessage({ type: 'error', text: `${getLanguageName(lang)} dili için liste öğeleri zorunludur!` });
          return false;
        }
      }
    }
    
    if (selectedType === 'mixed' && mixedElements.length === 0) {
      setMessage({ type: 'error', text: 'En az bir içerik elementi ekleyin' });
      return false;
    }
    
    return true;
  };

  const getLanguageName = (code: string) => {
    const names = { tr: 'Türkçe', en: 'İngilizce', de: 'Almanca', fr: 'Fransızca' };
    return names[code as keyof typeof names] || code;
  };

  const handleSave = async () => {
    if (!selectedSolution || !selectedType) {
      setMessage({ type: 'error', text: 'Lütfen solution ve içerik türünü seçin' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const languages = ['tr', 'en', 'de', 'fr'];
      const contents = languages.map((language) => {
        const content = multiLanguageContent[language as keyof MultiLanguageContent];
        
        let finalContent;
        if (selectedType === 'mixed') {
          // Karışık içerik için HTML oluştur
          finalContent = generateMixedContentHTML(content.title, 'vertical', mixedElements);
        } else {
          // Tek içerik için JSON string
          finalContent = JSON.stringify(content.content);
        }

        return {
          language,
          title: content.title,
          content: finalContent
        };
      });

      const requestData = {
        solutionId: selectedSolution.id,
        type: selectedType,
        contents,
        order: 1
      };

      const url = editingContent 
        ? `http://localhost:5000/api/solution-extra-content/${editingContent.id}`
        : 'http://localhost:5000/api/solution-extra-content/multi';
      
      const method = editingContent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'İçerik kaydedilirken hata oluştu');
      }

      const result = await response.json();
      setMessage({ type: 'success', text: editingContent ? 'İçerik başarıyla güncellendi!' : 'Tüm diller için içerik başarıyla eklendi!' });
      
      // Callback çağır
      if (onContentAdded) {
        onContentAdded();
      } else {
        // Formu temizle (eski davranış)
        setMultiLanguageContent({
          tr: { title: '', content: null },
          en: { title: '', content: null },
          de: { title: '', content: null },
          fr: { title: '', content: null }
        });
        if (selectedType === 'mixed') {
          setMixedElements([]);
        }
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Eski davranış - formu temizle
      setSelectedSolution(null);
      setSelectedType(null);
      setMultiLanguageContent({
        tr: { title: '', content: null },
        en: { title: '', content: null },
        de: { title: '', content: null },
        fr: { title: '', content: null }
      });
      setMixedElements([]);
      setMessage(null);
    }
  };

  const renderContentEditor = (language: string) => {
    if (!selectedType) return null;

    const content = multiLanguageContent[language as keyof MultiLanguageContent];

    if (selectedType === 'mixed') {
      return (
        <MixedContentEditor
          title={content.title}
          onTitleChange={(title) => handleTitleChange(language, title)}
          elements={mixedElements}
          onElementsChange={setMixedElements}
        />
      );
    }

    switch (selectedType) {
      case 'text':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metin İçeriği:
            </label>
            <textarea
              value={content.content || ''}
              onChange={(e) => handleContentChange(language, e.target.value)}
              placeholder="Metninizi yazın..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case 'table':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tablo Verileri:
            </label>
            <SimpleTableBuilder 
              data={content.content}
              onChange={(newContent) => handleContentChange(language, newContent)}
            />
          </div>
        );

      case 'list':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Liste Verileri:
            </label>
            <SimpleListBuilder 
              data={content.content}
              onChange={(newContent) => handleContentChange(language, newContent)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="solution-extra-content-adder p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {editingContent ? 'Ekstra İçerik Düzenle' : 'Solution Ekstra İçerik Ekleme (Çoklu Dil)'}
      </h2>

      {/* Adım 1: Solution Seçimi */}
      <div className="mb-8">
        <SolutionSelector onSolutionSelect={handleSolutionSelect} />
        {selectedSolution && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              Seçilen Solution: <strong>{selectedSolution.title}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Adım 2: İçerik Türü Seçimi */}
      {selectedSolution && (
        <div className="mb-8">
          <ContentTypeSelector 
            onTypeSelect={handleTypeSelect}
            selectedType={selectedType}
          />
        </div>
      )}

      {/* Adım 3: Çoklu Dil İçerik Detayları */}
      {selectedSolution && selectedType && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Çoklu Dil İçerik Detayları</h3>
          
          <div className="space-y-8">
            {(['tr', 'en', 'de', 'fr'] as const).map((language) => (
              <div key={language} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">
                    {language === 'tr' && '🇹🇷'}
                    {language === 'en' && '🇬🇧'}
                    {language === 'de' && '🇩🇪'}
                    {language === 'fr' && '🇫🇷'}
                  </span>
                  {getLanguageName(language)} İçeriği
                  <span className="ml-2 text-red-500">*</span>
                </h4>
                
                <div className="space-y-4">
                  {/* Başlık - Karışık içerik için ayrı */}
                  {selectedType !== 'mixed' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İçerik Başlığı:
                      </label>
                      <input
                        type="text"
                        value={multiLanguageContent[language].title}
                        onChange={(e) => handleTitleChange(language, e.target.value)}
                        placeholder={`${getLanguageName(language)} başlık girin...`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  )}

                  {/* İçerik Editörü */}
                  {renderContentEditor(language)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Butonlar */}
      {selectedSolution && selectedType && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Kaydediliyor...' : (editingContent ? 'Güncelle' : '💾 Tüm Dillerde Kaydet')}
          </button>
        </div>
      )}
    </div>
  );
};

export default SolutionExtraContentAdder;