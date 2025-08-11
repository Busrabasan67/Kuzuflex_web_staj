import React, { useState, useEffect } from 'react';
import SolutionSelector from './SolutionSelector';
import ContentTypeSelector from './ContentTypeSelector';
import SimpleTableBuilder from './SimpleTableBuilder';
import SimpleListBuilder from './SimpleListBuilder';
import MixedContentEditor from './MixedContentEditor';
import RichTextEditor from './RichTextEditor';
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
  initialSolution?: Solution | null;
}

type Step = 'solution' | 'type' | 'content' | 'review';

const SolutionExtraContentAdder: React.FC<SolutionExtraContentAdderProps> = ({ 
  onContentAdded,
  onCancel,
  editingContent = null,
  initialSolution = null
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('solution');
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(initialSolution);
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [multiLanguageContent, setMultiLanguageContent] = useState<MultiLanguageContent>({
    tr: { title: '', content: null },
    en: { title: '', content: null },
    de: { title: '', content: null },
    fr: { title: '', content: null }
  });
  const [mixedElements, setMixedElements] = useState<{ [language: string]: ContentElement[] }>({
    tr: [],
    en: [],
    de: [],
    fr: []
  });
  const [layoutByLang, setLayoutByLang] = useState<Record<string, 'vertical' | 'horizontal' | 'grid'>>({
    tr: 'vertical',
    en: 'vertical',
    de: 'vertical',
    fr: 'vertical'
  });
  const [activeLangTab, setActiveLangTab] = useState<'tr' | 'en' | 'de' | 'fr'>('tr');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Düzenleme modu için başlangıç verilerini yükle
  useEffect(() => {
    if (editingContent) {
      setCurrentStep('content');
      setSelectedType(editingContent.type as ContentType);
      fetchSolutionForEditing(editingContent.solutionId);
      
      // Eğer multiLanguageData varsa (tüm dillerdeki içerikler)
        if ((editingContent as any).multiLanguageData) {
        const multiData = (editingContent as any).multiLanguageData;
        
      if (editingContent.type === 'mixed') {
          // Mixed content için özel yükleme
          const newMixedElements: { [language: string]: ContentElement[] } = {
            tr: [],
            en: [],
            de: [],
            fr: []
          };
          const newLayoutByLang: Record<string, 'vertical' | 'horizontal' | 'grid'> = {
            tr: 'vertical',
            en: 'vertical', 
            de: 'vertical',
            fr: 'vertical'
          };
            // Başlıkları da doldurmak için başlangıç state'i hazırla
            const newMultiLanguage: MultiLanguageContent = {
              tr: { title: '', content: null },
              en: { title: '', content: null },
              de: { title: '', content: null },
              fr: { title: '', content: null }
            };
          
          // Her dil için mixed content'i yükle
          Object.keys(multiData).forEach(lang => {
            try {
              const content = multiData[lang];
              // Varolan başlığı aktar
              newMultiLanguage[lang as keyof MultiLanguageContent].title = content.title || '';
              if (content.content) {
                let parsedContent;
                if (typeof content.content === 'string') {
                  parsedContent = JSON.parse(content.content);
                } else {
                  parsedContent = content.content;
                }
                
                // Mixed content'i parse et
                console.log(`🔍 ${lang} mixed content parsing:`, parsedContent);
                if (parsedContent) {
                  // Yeni format: JSON içinde hem HTML hem de JSON data var
                  if (parsedContent.json) {
                    console.log(`✅ ${lang} JSON format detected:`, parsedContent.json);
                    // JSON formatından yükle
                    const jsonData = parsedContent.json;
                    newLayoutByLang[lang as keyof typeof newLayoutByLang] = jsonData.layout || 'vertical';
                    newMixedElements[lang as keyof typeof newMixedElements] = jsonData.elements || [];
                    console.log(`📦 ${lang} loaded elements:`, jsonData.elements);
                  } else if (typeof parsedContent === 'string') {
                    console.log(`📄 ${lang} HTML string format detected:`, parsedContent);
                    // Eski format: Sadece HTML string
                    // HTML içeriğini parse et ve elementleri çıkar
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = parsedContent;
                    
                    // Layout bilgisini çıkar (data-layout attribute'u varsa)
                    const container = tempDiv.querySelector('[data-layout]');
                    if (container) {
                      newLayoutByLang[lang as keyof typeof newLayoutByLang] = 
                        container.getAttribute('data-layout') as any || 'vertical';
                    }
                    
                    // Elementleri parse et (bu kısım MixedContentEditor'ın formatına uygun olmalı)
                    const elements: ContentElement[] = [];
                    const contentElements = tempDiv.querySelectorAll('[data-element]');
                    
                    contentElements.forEach((el, index) => {
                      const elementType = el.getAttribute('data-type') || 'text';
                      const elementContent = el.textContent || '';
                      const position = el.getAttribute('data-position') || 'full';
                      const width = el.getAttribute('data-width') || '100%';
                      
                      elements.push({
                        id: `element-${index}`,
                        type: elementType as 'text' | 'image' | 'table' | 'list',
                        content: elementContent,
                        position: position as 'left' | 'right' | 'full',
                        width: width as '25%' | '50%' | '75%' | '100%'
                      });
                    });
                    
                    newMixedElements[lang as keyof typeof newMixedElements] = elements;
                    console.log(`📦 ${lang} parsed elements:`, elements);
                  }
                }
              }
            } catch (error) {
              console.error(`Mixed content parsing error for ${lang}:`, error);
            }
          });
          
          setMixedElements(newMixedElements);
          setLayoutByLang(newLayoutByLang);
            setMultiLanguageContent(newMultiLanguage);
        } else {
          // Tüm dillerdeki mevcut içerikleri yükle
          const newMultiLanguageContent = {
            tr: { title: '', content: null },
            en: { title: '', content: null },
            de: { title: '', content: null },
            fr: { title: '', content: null }
          };
          
          Object.keys(multiData).forEach(lang => {
            try {
              const content = multiData[lang];
              
              let parsedContent = null;
              if (content.content) {
                if (typeof content.content === 'string') {
                  parsedContent = JSON.parse(content.content);
                } else {
                  parsedContent = content.content;
                }
              }
              
              newMultiLanguageContent[lang as keyof MultiLanguageContent] = {
                title: content.title || '',
                content: parsedContent
              };
            } catch (error) {
              console.error(`Content parsing error for ${lang}:`, error);
              const content = multiData[lang];
              newMultiLanguageContent[lang as keyof MultiLanguageContent] = {
                title: content.title || '',
                content: content.content || null
              };
            }
          });
          
          setMultiLanguageContent(newMultiLanguageContent);
        }
      } else {
        // Tek dil için eski yöntem
        if (editingContent.type === 'mixed') {
          // Tek dil mixed content için yükleme
          try {
            const parsedContent = JSON.parse(editingContent.content);
            if (parsedContent) {
              // Yeni format: JSON içinde hem HTML hem de JSON data var
              if (parsedContent.json) {
                const jsonData = parsedContent.json;
                setLayoutByLang(prev => ({
                  ...prev,
                  [editingContent.language]: jsonData.layout || 'vertical'
                }));
                setMixedElements(prev => ({
                  ...prev,
                  [editingContent.language]: jsonData.elements || []
                }));
                  // Başlığı da doldur
                  setMultiLanguageContent(prev => ({
                    ...prev,
                    [editingContent.language]: { title: editingContent.title, content: null }
                  }));
              } else if (typeof parsedContent === 'string') {
                // Eski format: Sadece HTML string
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = parsedContent;
                
                const elements: ContentElement[] = [];
                const contentElements = tempDiv.querySelectorAll('[data-element]');
                
                contentElements.forEach((el, index) => {
                  const elementType = el.getAttribute('data-type') || 'text';
                  const elementContent = el.textContent || '';
                  const position = el.getAttribute('data-position') || 'full';
                  const width = el.getAttribute('data-width') || '100%';
                  
                  elements.push({
                    id: `element-${index}`,
                    type: elementType as 'text' | 'image' | 'table' | 'list',
                    content: elementContent,
                    position: position as 'left' | 'right' | 'full',
                    width: width as '25%' | '50%' | '75%' | '100%'
                  });
                });
                
                setMixedElements(prev => ({
                  ...prev,
                  [editingContent.language]: elements
                }));
                  setMultiLanguageContent(prev => ({
                    ...prev,
                    [editingContent.language]: { title: editingContent.title, content: null }
                  }));
              }
            }
          } catch (error) {
            console.error('Mixed content parsing error:', error);
          }
      } else {
        try {
          const parsedContent = JSON.parse(editingContent.content);
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
    } else if (initialSolution) {
      setSelectedSolution(initialSolution);
      setCurrentStep('type');
    }
  }, [editingContent, initialSolution]);

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
    setCurrentStep('type');
    setMessage(null);
  };

  const handleTypeSelect = (type: ContentType) => {
    setSelectedType(type);
    if (type === 'mixed') {
      setMixedElements({
        tr: [],
        en: [],
        de: [],
        fr: []
      });
      setLayoutByLang({ tr: 'vertical', en: 'vertical', de: 'vertical', fr: 'vertical' });
    } else {
      const defaultContent = getDefaultContent(type);
      setMultiLanguageContent({
        tr: { title: '', content: defaultContent },
        en: { title: '', content: defaultContent },
        de: { title: '', content: defaultContent },
        fr: { title: '', content: defaultContent }
      });
    }
    setCurrentStep('content');
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
    
    if (selectedType === 'mixed') {
      const hasContent = ['tr', 'en', 'de', 'fr'].some(lang => 
        mixedElements[lang] && mixedElements[lang].length > 0
      );
      if (!hasContent) {
        setMessage({ type: 'error', text: 'En az bir dilde içerik elementi ekleyin' });
      return false;
      }
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
          // Mixed content için hem HTML hem de JSON formatında kaydet
          const htmlContent = generateMixedContentHTML(content.title, layoutByLang[language], mixedElements[language] || []);
          const jsonContent = {
            title: content.title,
            layout: layoutByLang[language],
            elements: mixedElements[language] || []
          };
          finalContent = JSON.stringify({
            html: htmlContent,
            json: jsonContent
          });
          console.log(`💾 ${language} mixed content saved:`, {
            html: htmlContent,
            json: jsonContent
          });
        } else {
          finalContent = JSON.stringify(content.content);
        }

        return {
          language,
          title: content.title,
          content: finalContent
        };
      });

      const requestData: any = {
        solutionId: selectedSolution.id,
        type: selectedType,
        contents,
        order: 1
      };

      // Düzenleme modu için özel kontrol
      const isGroupEdit = editingContent && (editingContent as any).multiLanguageData;

      let url, method;
      if (isGroupEdit) {
        // Grup düzenleme için özel endpoint
        url = 'http://localhost:5000/api/solution-extra-content/update-group';
        method = 'PUT';
        // Grup ID'sini ekle
        requestData.groupId = editingContent.id;
      } else if (editingContent) {
        // Tek içerik düzenleme
        url = `http://localhost:5000/api/solution-extra-content/${editingContent.id}`;
        method = 'PUT';
      } else {
        // Yeni içerik ekleme
        url = 'http://localhost:5000/api/solution-extra-content/multi';
        method = 'POST';
      }

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

      await response.json();
      
      setMessage({ type: 'success', text: editingContent ? 'İçerik başarıyla güncellendi!' : 'Tüm diller için içerik başarıyla eklendi!' });
      
      if (onContentAdded) {
        onContentAdded();
      }
    } catch (error) {
      console.error('handleSave error:', error);
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
    }
  };

  const renderContentEditor = (language: string) => {
    if (!selectedType) return null;

    const content = multiLanguageContent[language as keyof MultiLanguageContent];

    if (selectedType === 'mixed') {
      console.log(`🎨 ${language} MixedContentEditor props:`, {
        title: content.title,
        elements: mixedElements[language] || [],
        layout: layoutByLang[language],
        mixedElements: mixedElements,
        layoutByLang: layoutByLang
      });
      
      return (
        <MixedContentEditor
          title={content.title}
          onTitleChange={(title) => handleTitleChange(language, title)}
          elements={mixedElements[language] || []}
          onElementsChange={(elements) => {
            console.log(`🔄 ${language} elements changed:`, elements);
            setMixedElements(prev => ({
              ...prev,
              [language]: elements
            }));
          }}
          layout={layoutByLang[language]}
          onLayoutChange={(lay) => setLayoutByLang(prev => ({ ...prev, [language]: lay }))}
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
            <RichTextEditor
              value={content.content || ''}
              onChange={(value) => handleContentChange(language, value)}
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

  const getStepStatus = (step: Step) => {
    if (step === 'solution') return selectedSolution ? 'completed' : 'current';
    if (step === 'type') return selectedType ? 'completed' : selectedSolution ? 'current' : 'upcoming';
    if (step === 'content') return selectedType ? 'current' : 'upcoming';
    return 'upcoming';
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'solution', label: 'Solution Seçimi', icon: '🏢', description: 'Hangi solution için içerik ekleyeceğinizi seçin' },
      { key: 'type', label: 'İçerik Türü', icon: '📝', description: 'Ne tür içerik oluşturacağınızı belirleyin' },
      { key: 'content', label: 'İçerik Düzenleme', icon: '✏️', description: 'Her dil için içeriğinizi oluşturun' },
      { key: 'review', label: 'Önizleme', icon: '👁️', description: 'Son kontrol ve kaydetme' }
    ];

    return (
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">İlerleme Durumu</h3>
          <div className="text-sm text-gray-600">
            Adım {steps.findIndex(s => getStepStatus(s.key as Step) === 'current') + 1} / {steps.length}
          </div>
        </div>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.key as Step);
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    status === 'completed' ? 'bg-green-500 border-green-500 text-white shadow-lg' :
                    status === 'current' ? 'bg-blue-500 border-blue-500 text-white shadow-lg scale-110' :
                    'bg-gray-200 border-gray-300 text-gray-500'
                  }`}>
                    {status === 'completed' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-lg">{step.icon}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      status === 'completed' ? 'text-green-600' :
                      status === 'current' ? 'text-blue-600' :
                      'text-gray-500'
                    }`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>
                {!isLast && (
                  <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                    status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {editingContent ? 'İçerik Düzenle' : 'Yeni İçerik Ekle'}
      </h2>
            <p className="text-gray-600 mt-1">
              {editingContent ? 'Mevcut içeriği güncelleyin' : 'Solution için yeni içerik oluşturun'}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 rounded-full p-2 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      <div className="px-8 py-6">
        {/* Step 1: Solution Selection */}
        {currentStep === 'solution' && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <SolutionSelector onSolutionSelect={handleSolutionSelect} />
            </div>
          </div>
        )}

        {/* Step 2: Content Type Selection */}
        {currentStep === 'type' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">İçerik Türü Seçimi</h3>
              <p className="text-gray-600 max-w-md mx-auto">Ne tür bir içerik oluşturmak istiyorsunuz? Her türün kendine özgü özellikleri vardır.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <ContentTypeSelector 
            onTypeSelect={handleTypeSelect}
            selectedType={selectedType}
          />
            </div>
        </div>
      )}

        {/* Step 3: Content Editing */}
        {currentStep === 'content' && selectedType && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <span className="text-2xl">✏️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">İçerik Düzenleme</h3>
              <p className="text-gray-600 max-w-md mx-auto">Her dil için içeriğinizi oluşturun. Tüm dillerde aynı bilgileri farklı dillerde yazın.</p>
            </div>

            {/* Dil Sekmeleri */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Dil Seçimi</h4>
                <div className="inline-flex rounded-lg shadow-sm overflow-hidden border">
                  {(['tr', 'en', 'de', 'fr'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLangTab(lang)}
                      className={`${activeLangTab === lang ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} px-6 py-3 text-sm font-medium border-r last:border-r-0 transition-all duration-200 hover:bg-blue-50`}
                    >
                      {lang === 'tr' && '🇹🇷 Türkçe'}
                      {lang === 'en' && '🇬🇧 İngilizce'}
                      {lang === 'de' && '🇩🇪 Almanca'}
                      {lang === 'fr' && '🇫🇷 Fransızca'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aktif dil paneli */}
            {(['tr', 'en', 'de', 'fr'] as const).map((language) => (
                <div key={language} className={`${activeLangTab === language ? 'block' : 'hidden'}`}>
                  <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">
                    {language === 'tr' && '🇹🇷'}
                    {language === 'en' && '🇬🇧'}
                    {language === 'de' && '🇩🇪'}
                    {language === 'fr' && '🇫🇷'}
                  </span>
                  {getLanguageName(language)} İçeriği
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mesaj */}
      {message && (
          <div className={`mt-4 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => {
              if (currentStep === 'type') setCurrentStep('solution');
              else if (currentStep === 'content') setCurrentStep('type');
            }}
            disabled={currentStep === 'solution'}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Geri
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              İptal
            </button>
            {currentStep === 'content' && (
          <button
            onClick={handleSave}
            disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-lg"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {editingContent ? 'Güncelle' : 'Kaydet'}
                  </>
                )}
          </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionExtraContentAdder;