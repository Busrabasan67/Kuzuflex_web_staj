import React, { useState } from 'react';
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

interface TableData {
  headers: string[];
  rows: string[][];
}

interface ListData {
  items: string[];
  type: 'ordered' | 'unordered';
}

const SolutionExtraContentAdder: React.FC = () => {
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<any>(null);
  const [mixedElements, setMixedElements] = useState<ContentElement[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSolutionSelect = (solution: Solution) => {
    setSelectedSolution(solution);
    setSelectedType(null);
    setTitle('');
    setContent(null);
    setMixedElements([]);
    setMessage(null);
  };

  const handleTypeSelect = (type: ContentType) => {
    setSelectedType(type);
    if (type === 'mixed') {
      setMixedElements([]);
    } else {
      setContent(getDefaultContent(type));
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

  const handleContentChange = (newContent: any) => {
    setContent(newContent);
  };

  const handleSave = async () => {
    if (!selectedSolution || !selectedType || !title) {
      setMessage({ type: 'error', text: 'Lütfen tüm alanları doldurun' });
      return;
    }

    // Karışık içerik için özel kontrol
    if (selectedType === 'mixed' && mixedElements.length === 0) {
      setMessage({ type: 'error', text: 'En az bir içerik elementi ekleyin' });
      return;
    }

    // Tek içerik için kontrol
    if (selectedType !== 'mixed' && !content) {
      setMessage({ type: 'error', text: 'İçerik boş olamaz' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      let finalContent;
      if (selectedType === 'mixed') {
        // Karışık içerik için HTML oluştur
        finalContent = generateMixedContentHTML(title, 'vertical', mixedElements);
      } else {
        // Tek içerik için JSON string
        finalContent = JSON.stringify(content);
      }

      const response = await fetch('http://localhost:5000/api/solution-extra-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solutionId: selectedSolution.id,
          type: selectedType,
          title,
          content: finalContent,
          order: 1,
          language: 'tr'
        }),
      });

      if (!response.ok) {
        throw new Error('İçerik eklenirken hata oluştu');
      }

      const result = await response.json();
      setMessage({ type: 'success', text: 'İçerik başarıyla eklendi!' });
      
      // Formu temizle
      setTitle('');
      if (selectedType === 'mixed') {
        setMixedElements([]);
      } else {
        setContent(getDefaultContent(selectedType));
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

  const renderContentEditor = () => {
    if (!selectedType) return null;

    if (selectedType === 'mixed') {
      return (
        <MixedContentEditor
          title={title}
          onTitleChange={setTitle}
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
              value={content || ''}
              onChange={(e) => handleContentChange(e.target.value)}
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
              data={content}
              onChange={handleContentChange}
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
              data={content}
              onChange={handleContentChange}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="solution-extra-content-adder p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Solution Ekstra İçerik Ekleme</h2>

      {/* Adım 1: Solution Seçimi */}
      <div className="mb-8">
        <SolutionSelector onSolutionSelect={handleSolutionSelect} />
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

      {/* Adım 3: İçerik Detayları */}
      {selectedSolution && selectedType && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">İçerik Detayları</h3>
          
          <div className="space-y-4">
            {/* Başlık - Karışık içerik için ayrı */}
            {selectedType !== 'mixed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İçerik Başlığı:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="İçerik başlığını girin..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* İçerik Editörü */}
            {renderContentEditor()}
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

      {/* Kaydet Butonu */}
      {selectedSolution && selectedType && (
        <button
          onClick={handleSave}
          disabled={saving || !title || (selectedType !== 'mixed' && !content) || (selectedType === 'mixed' && mixedElements.length === 0)}
          className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Kaydediliyor...' : '💾 İçeriği Kaydet'}
        </button>
      )}
    </div>
  );
};

export default SolutionExtraContentAdder;