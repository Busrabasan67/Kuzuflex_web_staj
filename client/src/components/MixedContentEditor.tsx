import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import SimpleTableBuilder from './SimpleTableBuilder';
import SimpleListBuilder from './SimpleListBuilder';
import { generateMixedContentHTML } from '../utils/htmlGenerators';

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
  layout: 'vertical' | 'horizontal' | 'grid';
  onLayoutChange: (layout: 'vertical' | 'horizontal' | 'grid') => void;
}

const MixedContentEditor: React.FC<MixedContentEditorProps> = ({
  title,
  onTitleChange,
  elements,
  onElementsChange,
  layout,
  onLayoutChange
}) => {
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Debug: Log when elements change
  useEffect(() => {
    console.log('MixedContentEditor elements changed:', elements);
  }, [elements]);

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
    console.log('Updating element:', elementId, updates);
    const updatedElements = elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );
    console.log('Updated elements:', updatedElements);
    onElementsChange(updatedElements);
  };

  const moveElement = (elementId: string, direction: 'up' | 'down') => {
    const currentIndex = elements.findIndex(el => el.id === elementId);
    if (currentIndex === -1) return;

    let newIndex: number;
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < elements.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      return;
    }

    const newElements = [...elements];
    [newElements[currentIndex], newElements[newIndex]] = [newElements[newIndex], newElements[currentIndex]];
    onElementsChange(newElements);
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text':
        return '';
      case 'table':
        return {
          headers: ['Başlık 1', 'Başlık 2'],
          rows: [['Veri 1', 'Veri 2']],
          styles: [
            { backgroundColor: '#ffffff', textColor: '#000000', headerBackgroundColor: '#f3f4f6', headerTextColor: '#000000' },
            { backgroundColor: '#ffffff', textColor: '#000000', headerBackgroundColor: '#f3f4f6', headerTextColor: '#000000' }
          ]
        };
      case 'list':
        return { items: ['Madde 1', 'Madde 2'], type: 'unordered' as const };
      case 'image':
        return '';
      default:
        return '';
    }
  };

  const handleLayoutChange = (newLayout: 'vertical' | 'horizontal' | 'grid') => {
    // Layout değiştiğinde elementlerin konumlarını otomatik ayarla
    if (newLayout === 'horizontal' && elements.length > 0) {
      const updatedElements = elements.map((element, index) => {
        if (index === 0) {
          return { ...element, position: 'left' as const, width: '50%' as const };
        } else if (index === 1) {
          return { ...element, position: 'right' as const, width: '50%' as const };
        } else {
          return { ...element, position: 'full' as const, width: '100%' as const };
        }
      });
      onElementsChange(updatedElements);
    } else if (newLayout === 'grid') {
      const updatedElements = elements.map((element) => ({
        ...element,
        position: 'full' as const,
        width: '100%' as const
      }));
      onElementsChange(updatedElements);
    } else if (newLayout === 'vertical') {
      const updatedElements = elements.map((element) => ({
        ...element,
        position: 'full' as const,
        width: '100%' as const
      }));
      onElementsChange(updatedElements);
    }
    
    onLayoutChange(newLayout);
  };

  const handleImageUpload = async (elementId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file);
    if (!file) {
      console.log('No file selected');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5000/api/solution-extra-content/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not ok:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Upload response data:', data);
      updateElement(elementId, { content: data.url });
    } catch (error) {
      alert(`Resim yükleme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const renderElementEditor = (element: ContentElement) => {
    return (
      <div className="space-y-4">
        {/* Konum ve Boyut Kontrolleri */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Konum:
            </label>
            <select
              value={element.position || 'full'}
              onChange={(e) => updateElement(element.id, { position: e.target.value as 'left' | 'right' | 'full' })}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="full">Tam Genişlik</option>
              <option value="left">Sol Taraf</option>
              <option value="right">Sağ Taraf</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Boyut:
            </label>
            <select
              value={element.width || '100%'}
              onChange={(e) => updateElement(element.id, { width: e.target.value as '25%' | '50%' | '75%' | '100%' })}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="100%">Tam Genişlik</option>
              <option value="75%">Geniş</option>
              <option value="50%">Orta</option>
              <option value="25%">Dar</option>
            </select>
          </div>
        </div>

        {/* İçerik Editörü */}
        <div>
          {(() => {
            switch (element.type) {
              case 'text':
                return (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Metin İçeriği:
                    </label>
                    <RichTextEditor
                      value={element.content || ''}
                      onChange={(value) => updateElement(element.id, { content: value })}
                      placeholder="Metninizi yazın..."
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
                        <div className="text-sm text-gray-600 mb-2">
                          Mevcut resim: {element.content}
                        </div>
                        <img 
                          src={element.content.startsWith('/uploads/') ? `http://localhost:5000${element.content}` : element.content} 
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
                          onChange={(e) => {
                            console.log('File input onChange triggered:', e);
                            handleImageUpload(element.id, e);
                          }}
                          disabled={uploading}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          id={`image-upload-${element.id}`}
                        />
                        {uploading && (
                          <div className="text-blue-500 text-sm">
                            Yükleniyor...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );

              default:
                return null;
            }
          })()}
        </div>
      </div>
    );
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
          onChange={(e) => handleLayoutChange(e.target.value as 'vertical' | 'horizontal' | 'grid')}
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveElement(element.id, 'up')}
                  className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                  title="Yukarı taşı"
                >▲</button>
                <button
                  onClick={() => moveElement(element.id, 'down')}
                  className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                  title="Aşağı taşı"
                >▼</button>
                <button
                  onClick={() => removeElement(element.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ❌ Kaldır
                </button>
              </div>
            </div>

            {renderElementEditor(element)}
          </div>
        ))}
      </div>

      {/* Önizleme */}
      {elements.length > 0 && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Önizleme:</h4>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              {showPreview ? '👁️ Gizle' : '👁️ Göster'}
            </button>
          </div>
          
          {showPreview && (
            <>
              {/* Layout Bilgisi */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <span className="font-medium">📐 Seçili Düzen:</span>
                  <span className="px-2 py-1 bg-blue-100 rounded">
                    {layout === 'vertical' && '📄 Dikey (Alt alta)'}
                    {layout === 'horizontal' && '↔️ Yatay (Yan yana)'}
                    {layout === 'grid' && '🔲 Grid (Izgara)'}
                  </span>
                </div>
              </div>

              {/* Element Konum Bilgileri */}
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <h5 className="text-sm font-medium text-green-700 mb-2">📍 Element Konumları:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {elements.map((element, index) => (
                    <div key={element.id} className="text-xs bg-green-100 p-2 rounded">
                      <div className="font-medium text-green-800">
                        {index + 1}. {getElementTypeName(element.type)}
                      </div>
                      <div className="text-green-600">
                        Konum: {element.position === 'left' ? '⬅️ Sol' : element.position === 'right' ? '➡️ Sağ' : '🔄 Tam'}
                      </div>
                      <div className="text-green-600">
                        Boyut: {element.width}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Canlı Önizleme */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="mb-2 text-xs text-gray-500 font-medium">🎯 Canlı Önizleme:</div>
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: generateMixedContentHTML(title, layout, elements) 
                  }}
                />
              </div>
            </>
          )}
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