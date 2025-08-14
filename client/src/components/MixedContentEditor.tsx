import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import SimpleTableBuilder from './SimpleTableBuilder';
import SimpleListBuilder from './SimpleListBuilder';
import { generateMixedContentHTML } from '../utils/htmlGenerators';
import type { ContentElement } from '../utils/htmlGenerators';

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
  const [previewMode, setPreviewMode] = useState<'inline' | 'side'>('inline');
  const [expandedElements, setExpandedElements] = useState<Set<string>>(new Set());

  // Debug: Log when elements change
  useEffect(() => {
    console.log('MixedContentEditor elements changed:', elements);
    // Tüm elemanları başlangıçta açık hale getir
    setExpandedElements(new Set(elements.map(e => e.id)));
  }, [elements]);

  const addElement = (type: 'text' | 'image' | 'table' | 'list') => {
    const newElement: ContentElement = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      position: 'full',
      width: '100%',
      // Default positioning
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      padding: 0,
      // Default text styles
      lineHeight: 1.6,
      fontWeight: 'normal',
      // Default image styles
      imageWidthPercent: 100,
      imageMaxHeightPx: 0,
      imageAlign: 'center',
      imageFloat: 'none',
      // Default border styles
      borderWidth: 0,
      borderColor: '#e5e7eb',
      borderRadius: 0,
      backgroundColor: 'transparent'
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

  const toggleElementExpanded = (elementId: string) => {
    setExpandedElements(prev => {
      const next = new Set(prev);
      if (next.has(elementId)) next.delete(elementId);
      else next.add(elementId);
      return next;
    });
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
          return { 
            ...element, 
            position: 'left' as const, 
            width: '50%' as const,
            marginRight: 10,
            marginLeft: 0
          };
        } else if (index === 1) {
          return { 
            ...element, 
            position: 'right' as const, 
            width: '50%' as const,
            marginLeft: 10,
            marginRight: 0
          };
        } else {
          return { 
            ...element, 
            position: 'full' as const, 
            width: '100%' as const,
            marginTop: 20,
            marginLeft: 0,
            marginRight: 0
          };
        }
      });
      onElementsChange(updatedElements);
    } else if (newLayout === 'grid') {
      const updatedElements = elements.map((element, index) => {
        // Grid'de element sayısına göre genişlik belirle
        let gridWidth: string;
        let position: string;
        
        if (elements.length === 1) {
          gridWidth = '100%';
          position = 'center';
        } else if (elements.length === 2) {
          gridWidth = '50%';
          position = index === 0 ? 'left' : 'right';
        } else {
          gridWidth = '33%';
          position = 'full';
        }
        
        return {
          ...element,
          position: position as any,
          width: gridWidth as any,
          marginRight: 10,
          marginBottom: 20,
          marginLeft: 10
        };
      });
      onElementsChange(updatedElements);
    } else if (newLayout === 'vertical') {
      const updatedElements = elements.map((element) => ({
        ...element,
        position: 'full' as const,
        width: '100%' as const,
        marginTop: 0,
        marginBottom: 20,
        marginLeft: 0,
        marginRight: 0
      }));
      onElementsChange(updatedElements);
    }
    
    onLayoutChange(newLayout);
  };

  const getTypeStyleClasses = (type: ContentElement['type']) => {
    switch (type) {
      case 'text':
        return {
          header: 'bg-blue-50 text-blue-700',
          border: 'border-blue-200'
        };
      case 'image':
        return {
          header: 'bg-green-50 text-green-700',
          border: 'border-green-200'
        };
      case 'table':
        return {
          header: 'bg-purple-50 text-purple-700',
          border: 'border-purple-200'
        };
      case 'list':
        return {
          header: 'bg-orange-50 text-orange-700',
          border: 'border-orange-200'
        };
      default:
        return { header: 'bg-gray-50 text-gray-700', border: 'border-gray-200' };
    }
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
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Genişlik (%)</label>
                            <input type="number" min={10} max={100} value={element.imageWidthPercent || 100} onChange={(e)=>updateElement(element.id,{ imageWidthPercent: Number(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Maks. Yükseklik (px)</label>
                            <input type="number" min={50} max={1200} value={element.imageMaxHeightPx || 0} onChange={(e)=>updateElement(element.id,{ imageMaxHeightPx: Number(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm" />
                          </div>
                        </div>
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

  const topControls = (
    <div className="space-y-4">
      {/* Başlık ve Önizleme Modu */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">İçerik Bloğu Başlığı:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="İçerik bloğu başlığını girin..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-2 text-sm rounded-lg border ${showPreview ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            {showPreview ? '👁️ Önizlemeyi Gizle' : '👁️ Önizlemeyi Göster'}
          </button>
          <button
            onClick={() => setPreviewMode(previewMode === 'inline' ? 'side' : 'inline')}
            className="px-3 py-2 text-sm rounded-lg border bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          >
            {previewMode === 'inline' ? '↔️ Yan Önizleme' : '⬇️ Alt Önizleme'}
          </button>
        </div>
      </div>

      {/* Layout Seçimi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Düzen:</label>
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <button
            onClick={() => handleLayoutChange('vertical')}
            className={`px-4 py-2 text-sm ${layout === 'vertical' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            📄 Dikey
          </button>
          <button
            onClick={() => handleLayoutChange('horizontal')}
            className={`px-4 py-2 text-sm border-l border-gray-200 ${layout === 'horizontal' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            ↔️ Yatay
          </button>
          <button
            onClick={() => handleLayoutChange('grid')}
            className={`px-4 py-2 text-sm border-l border-gray-200 ${layout === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            🔲 Grid
          </button>
        </div>
      </div>

      {/* Element Ekle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">İçerik Ekle:</label>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => addElement('text')} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm shadow-sm">📝 Metin</button>
          <button onClick={() => addElement('image')} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm shadow-sm">🖼️ Resim</button>
          <button onClick={() => addElement('table')} className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm shadow-sm">📊 Tablo</button>
          <button onClick={() => addElement('list')} className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm shadow-sm">📋 Liste</button>
        </div>
      </div>
    </div>
  );

  const elementsEditor = (
    <div className="space-y-4">
      {elements.map((element, index) => {
        const styles = getTypeStyleClasses(element.type);
        const isOpen = expandedElements.has(element.id);
        return (
          <div key={element.id} className={`border ${styles.border} rounded-xl overflow-hidden shadow-sm`}>
            <div className={`flex items-center justify-between px-4 py-2 ${styles.header}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 bg-white bg-opacity-70 rounded">
                  #{index + 1}
                </span>
                <h4 className="font-medium">{getElementTypeName(element.type)}</h4>
                <span className="text-xs text-gray-500">
                  {element.position === 'left' ? '⬅️ Sol' : 
                   element.position === 'right' ? '➡️ Sağ' : 
                   element.position === 'center' ? '🎯 Merkez' : '🔄 Tam'} · {element.width}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {(() => {
                  const isFirst = index === 0;
                  const isLast = index === elements.length - 1;
                  return (
                    <>
                      <button
                        onClick={() => { if (!isFirst) moveElement(element.id, 'up'); }}
                        className={`px-2 py-1 text-xs rounded ${isFirst ? 'bg-white/50 text-gray-400 cursor-not-allowed' : 'bg-white/80 hover:bg-white'}`}
                        title="Yukarı taşı"
                        disabled={isFirst}
                        aria-disabled={isFirst}
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => { if (!isLast) moveElement(element.id, 'down'); }}
                        className={`px-2 py-1 text-xs rounded ${isLast ? 'bg-white/50 text-gray-400 cursor-not-allowed' : 'bg-white/80 hover:bg-white'}`}
                        title="Aşağı taşı"
                        disabled={isLast}
                        aria-disabled={isLast}
                      >
                        ▼
                      </button>
                    </>
                  );
                })()}
                <button onClick={() => removeElement(element.id)} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100" title="Kaldır">🗑️</button>
                <button onClick={() => toggleElementExpanded(element.id)} className="ml-2 px-2 py-1 text-xs bg-white/80 rounded hover:bg-white" title={isOpen ? 'Daralt' : 'Genişlet'}>
                  {isOpen ? '–' : '+'}
                </button>
              </div>
            </div>
            {isOpen && (
              <div className="p-4 bg-white">
                {/* Positioning Controls - Layout'a göre farklı kontroller */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">📍 Konum ve Boyut Ayarları</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Genişlik</label>
                      <select 
                        value={element.width} 
                        onChange={(e) => updateElement(element.id, { width: e.target.value as any })}
                        className="w-full text-xs border rounded px-2 py-1"
                      >
                        <option value="25%">25%</option>
                        <option value="33%">33%</option>
                        <option value="50%">50%</option>
                        <option value="66%">66%</option>
                        <option value="75%">75%</option>
                        <option value="100%">100%</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Üst Boşluk (px)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={element.marginTop || 0} 
                        onChange={(e) => updateElement(element.id, { marginTop: Number(e.target.value) })} 
                        className="w-full text-xs border rounded px-2 py-1" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Alt Boşluk (px)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={element.marginBottom || 0} 
                        onChange={(e) => updateElement(element.id, { marginBottom: Number(e.target.value) })} 
                        className="w-full text-xs border rounded px-2 py-1" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">İç Boşluk (px)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="50" 
                        value={element.padding || 0} 
                        onChange={(e) => updateElement(element.id, { padding: Number(e.target.value) })} 
                        className="w-full text-xs border rounded px-2 py-1" 
                      />
                    </div>
                  </div>
                  
                  {/* Layout bilgisi */}
                  {layout === 'grid' && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                      💡 <strong>Grid Layout:</strong> Elementler otomatik olarak düzenli sıralanır. 
                      {elements.length === 1 && ' Tek element merkezde.'}
                      {elements.length === 2 && ' İki element yan yana.'}
                      {elements.length >= 3 && ' Üç veya daha fazla element grid düzeninde.'}
                      <br />
                      🔄 Element sırasını değiştirmek için yukarı/aşağı ok butonlarını kullanın.
                    </div>
                  )}
                </div>
                
                {/* Element Editor */}
                {renderElementEditor(element)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const previewPanel = (
    elements.length > 0 && showPreview ? (
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <span className="font-medium">📐 Seçili Düzen:</span>
            <span className="px-2 py-1 bg-blue-100 rounded">
              {layout === 'vertical' && '📄 Dikey (Alt alta)'}
              {layout === 'horizontal' && '↔️ Yatay (Yan yana)'}
              {layout === 'grid' && '🔲 Grid (Izgara)'}
            </span>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="mb-2 text-xs text-gray-500 font-medium">🎯 Canlı Önizleme</div>
          <div dangerouslySetInnerHTML={{ __html: generateMixedContentHTML(title, layout, elements.map(el => ({
            ...el,
            // Görünüm seçeneklerini HTML generator'a geçir
            content: el.type === 'image' && (el.imageWidthPercent || el.imageMaxHeightPx)
              ? { url: el.content, widthPercent: el.imageWidthPercent, maxHeightPx: el.imageMaxHeightPx }
              : el.content
          }))) }} />
        </div>
      </div>
    ) : null
  );

  return (
    <div className="mixed-content-editor space-y-6">
      {topControls}

      {previewMode === 'side' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>{elementsEditor}</div>
          <div>{previewPanel}</div>
        </div>
      ) : (
        <>
          {elementsEditor}
          {previewPanel}
        </>
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