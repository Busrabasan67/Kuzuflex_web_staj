import React, { useState } from 'react';

interface ListData {
  items: string[];
  type: 'ordered' | 'unordered';
}

interface SimpleListBuilderProps {
  data: ListData;
  onChange: (data: ListData) => void;
}

const SimpleListBuilder: React.FC<SimpleListBuilderProps> = ({ data, onChange }) => {
  const [listData, setListData] = useState<ListData>({
    items: data?.items || ['Madde 1', 'Madde 2'],
    type: data?.type || 'unordered'
  });

  const addItem = () => {
    const newData = {
      ...listData,
      items: [...listData.items, `Madde ${listData.items.length + 1}`]
    };
    setListData(newData);
    onChange(newData);
  };

  const removeItem = (index: number) => {
    if (listData.items.length <= 1) return;
    
    const newData = {
      ...listData,
      items: listData.items.filter((_, i) => i !== index)
    };
    setListData(newData);
    onChange(newData);
  };

  const updateItem = (index: number, value: string) => {
    const newData = {
      ...listData,
      items: listData.items.map((item, i) => i === index ? value : item)
    };
    setListData(newData);
    onChange(newData);
  };

  const changeType = (type: 'ordered' | 'unordered') => {
    const newData = { ...listData, type };
    setListData(newData);
    onChange(newData);
  };

  return (
    <div className="simple-list-builder">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Liste Türü:
        </label>
        <select
          value={listData.type}
          onChange={(e) => changeType(e.target.value as 'ordered' | 'unordered')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="unordered">📋 Numarasız Liste</option>
          <option value="ordered">🔢 Numaralı Liste</option>
        </select>
      </div>

      <div className="mb-4">
        <button
          onClick={addItem}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          ➕ Madde Ekle
        </button>
      </div>

      <div className="space-y-2">
        {listData.items.map((item, index) => (
          <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
            <span className="text-sm text-gray-500 min-w-[20px]">
              {listData.type === 'ordered' ? `${index + 1}.` : '•'}
            </span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder={`Madde ${index + 1}`}
            />
            {listData.items.length > 1 && (
              <button
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ❌
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleListBuilder;