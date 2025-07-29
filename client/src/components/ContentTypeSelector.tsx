import React from 'react';

export type ContentType = 'text' | 'table' | 'list' | 'mixed';

interface ContentTypeSelectorProps {
  onTypeSelect: (type: ContentType) => void;
  selectedType: ContentType | null;
}

const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({ onTypeSelect, selectedType }) => {
  const contentTypes = [
    {
      type: 'text' as ContentType,
      name: 'Metin',
      icon: '📝',
      description: 'Düz metin içeriği ekleyin',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      type: 'table' as ContentType,
      name: 'Tablo',
      icon: '📊',
      description: 'Veri tablosu oluşturun',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      type: 'list' as ContentType,
      name: 'Liste',
      icon: '📋',
      description: 'Madde listesi oluşturun',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      type: 'mixed' as ContentType,
      name: 'Karışık İçerik',
      icon: '🎨',
      description: 'Metin, resim, tablo ve liste birlikte',
      color: 'bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600'
    }
  ];

  return (
    <div className="content-type-selector">
      <h3 className="text-lg font-semibold mb-4">Hangi Tür İçerik Eklemek İstiyorsunuz?</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {contentTypes.map((contentType) => (
          <div
            key={contentType.type}
            onClick={() => onTypeSelect(contentType.type)}
            className={`p-6 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedType === contentType.type
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-2xl ${contentType.color}`}>
                {contentType.icon}
              </div>
              <h4 className="font-medium text-gray-900 mb-2">{contentType.name}</h4>
              <p className="text-sm text-gray-600">{contentType.description}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedType && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">
            Seçilen İçerik Türü: {contentTypes.find(ct => ct.type === selectedType)?.name}
          </h4>
          <p className="text-sm text-green-700">
            Şimdi içerik detaylarını girebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentTypeSelector;