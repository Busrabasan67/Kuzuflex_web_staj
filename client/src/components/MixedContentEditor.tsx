import React, { useState } from 'react';
import { generateMixedContentHTML } from '../utils/htmlGenerators';
import SimpleTableBuilder from './SimpleTableBuilder';
import SimpleListBuilder from './SimpleListBuilder';

// Local type definitions as backup
interface ContentElement {
  id: string;
  type: 'text' | 'image' | 'table' | 'list';
  content: any;
  position?: 'left' | 'right' | 'full';
  width?: '25%' | '50%' | '75%' | '100%';
}

interface MixedContentEditorProps {
  title: string;
  onTitleChange: (title: string) => void;
  elements: ContentElement[];
  onElementsChange: (elements: ContentElement[]) => void;
}

const MixedContentEditor: React.FC<MixedContentEditorProps> = ({
  title,
  onTitleChange,
  elements,
  onElementsChange
}) => {
  const [layout, setLayout] = useState<'vertical' | 'horizontal' | 'grid'>('vertical');
  const [uploading, setUploading] = useState(false);

  const addElement = (type: 'text' | 'image' | 'table' | 'list') => {
    const newElement: ContentElement = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      position: 'full',
      width: '100%'
    };
    onElementsChange([...elements, newElement]);
  };

  const removeElement = (elementId: string) => {
    onElementsChange(elements.filter(el => el.id !== elementId));
  };

  const updateElement = (elementId: string, updates: Partial<ContentElement>) => {
    onElementsChange(elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text':
        return '';
      case 'table':
        return { headers: ['Başlık 1', 'Başlık 2'], rows: [['Veri 1', 'Veri 2']] };
      case 'list':
        return { items: ['Madde 1', 'Madde 2'], type: 'unordered' as const };
      case 'image':
        return '';
      default:
        return null;
    }
  };

  const handleImageUpload = async (elementId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Sadece resim dosyaları yüklenebilir!');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('http://localhost:5000/api/upload/image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      // Tam URL'yi oluştur
      const fullImageUrl = `http://localhost:5000${result.url}`;
      updateElement(elementId, { content: fullImageUrl });
    } catch (error) {
      alert(`Resim yükleme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const renderElementEditor = (element: ContentElement) => {
    switch (element.type) {
      case 'text':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metin İçeriği:
            </label>
            <textarea
              value={element.content || ''}
              onChange={(e) => updateElement(element.id, { content: e.target.value })}
              placeholder="Metninizi yazın..."
              rows={4}
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
              data={element.content}
              onChange={(data) => updateElement(element.id, { content: data })}
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
              data={element.content}
              onChange={(data) => updateElement(element.id, { content: data })}
            />
          </div>
        );

      case 'image':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resim:
            </label>
            {element.content ? (
              <div className="space-y-2">
                <img 
                  src={element.content} 
                  alt="Preview" 
                  className="max-w-xs h-auto rounded border"
                />
                <button
                  onClick={() => updateElement(element.id, { content: '' })}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Resmi Kaldır
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(element.id, e)}
                  disabled={uploading}
                  className="hidden"
                  id={`image-upload-${element.id}`}
                />
                <label 
                  htmlFor={`image-upload-${element.id}`}
                  className="cursor-pointer text-blue-500 hover:text-blue-600"
                >
                  {uploading ? 'Yükleniyor...' : '📷 Resim Seç'}
                </label>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mixed-content-editor space-y-6">
      {/* Başlık */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          İçerik Bloğu Başlığı:
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="İçerik bloğu başlığını girin..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Layout Seçimi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Düzen:
        </label>
        <select
          value={layout}
          onChange={(e) => setLayout(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="vertical">📄 Dikey (Alt alta)</option>
          <option value="horizontal">↔️ Yatay (Yan yana)</option>
          <option value="grid">🔲 Grid (Izgara)</option>
        </select>
      </div>

      {/* Element Ekleme Butonları */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          İçerik Ekle:
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => addElement('text')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            📝 Metin Ekle
          </button>
          <button
            onClick={() => addElement('image')}
            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            🖼️ Resim Ekle
          </button>
          <button
            onClick={() => addElement('table')}
            className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
          >
            📊 Tablo Ekle
          </button>
          <button
            onClick={() => addElement('list')}
            className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
          >
            📋 Liste Ekle
          </button>
        </div>
      </div>

      {/* Elementler Listesi */}
      <div className="space-y-4">
        {elements.map((element, index) => (
          <div key={element.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">
                {index + 1}. {getElementTypeName(element.type)}
              </h4>
              <button
                onClick={() => removeElement(element.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ❌ Kaldır
              </button>
            </div>
            {renderElementEditor(element)}
          </div>
        ))}
      </div>

      {/* Önizleme */}
      {elements.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-900 mb-3">Önizleme:</h4>
          <div 
            className="bg-white border border-gray-200 rounded-lg p-4"
            dangerouslySetInnerHTML={{ 
              __html: generateMixedContentHTML(title, layout, elements) 
            }}
          />
        </div>
      )}
    </div>
  );
};

const getElementTypeName = (type: string) => {
  switch (type) {
    case 'text': return 'Metin';
    case 'image': return 'Resim';
    case 'table': return 'Tablo';
    case 'list': return 'Liste';
    default: return 'Bilinmeyen';
  }
};

export default MixedContentEditor;