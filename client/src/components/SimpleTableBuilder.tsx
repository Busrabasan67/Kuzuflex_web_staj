import React, { useState, useEffect } from 'react';

interface TableData {
  headers: string[];
  rows: string[][];
  styles?: ColumnStyle[]; // Stil bilgilerini ekle
}

interface ColumnStyle {
  backgroundColor: string;
  textColor: string;
  headerBackgroundColor: string;
  headerTextColor: string;
}

interface SimpleTableBuilderProps {
  data: TableData;
  onChange: (data: TableData) => void;
}

const SimpleTableBuilder: React.FC<SimpleTableBuilderProps> = ({ data, onChange }) => {
  const [tableData, setTableData] = useState<TableData>({
    headers: data?.headers || ['Başlık 1', 'Başlık 2'],
    rows: data?.rows || [['Veri 1', 'Veri 2']]
  });

  // Sütun stilleri için state
  const [columnStyles, setColumnStyles] = useState<ColumnStyle[]>([
    { backgroundColor: '#ffffff', textColor: '#000000', headerBackgroundColor: '#f3f4f6', headerTextColor: '#000000' },
    { backgroundColor: '#ffffff', textColor: '#000000', headerBackgroundColor: '#f3f4f6', headerTextColor: '#000000' }
  ]);

  // Varsayılan renk paleti
  const colorPalette = [
    { name: 'Beyaz', bg: '#ffffff', text: '#000000', headerBg: '#f3f4f6', headerText: '#000000' },
    { name: 'Mavi', bg: '#dbeafe', text: '#1e40af', headerBg: '#3b82f6', headerText: '#ffffff' },
    { name: 'Yeşil', bg: '#dcfce7', text: '#166534', headerBg: '#22c55e', headerText: '#ffffff' },
    { name: 'Sarı', bg: '#fef3c7', text: '#92400e', headerBg: '#eab308', headerText: '#000000' },
    { name: 'Pembe', bg: '#fce7f3', text: '#be185d', headerBg: '#ec4899', headerText: '#ffffff' },
    { name: 'Mor', bg: '#f3e8ff', text: '#7c3aed', headerBg: '#a855f7', headerText: '#ffffff' },
    { name: 'Turuncu', bg: '#fed7aa', text: '#c2410c', headerBg: '#f97316', headerText: '#ffffff' },
    { name: 'Gri', bg: '#f3f4f6', text: '#374151', headerBg: '#6b7280', headerText: '#ffffff' }
  ];

  // Data değiştiğinde stil state'lerini senkronize et
  useEffect(() => {
    if (data) {
      setTableData(data);
      
      // Eğer data'da stil bilgileri varsa kullan, yoksa varsayılan stiller oluştur
      if (data.styles && data.styles.length > 0) {
        setColumnStyles(data.styles);
      } else {
        // Yeni sütun sayısına göre stil state'lerini güncelle
        const currentStyles = [...columnStyles];
        while (currentStyles.length < data.headers.length) {
          currentStyles.push({ 
            backgroundColor: '#ffffff', 
            textColor: '#000000', 
            headerBackgroundColor: '#f3f4f6', 
            headerTextColor: '#000000' 
          });
        }
        
        if (currentStyles.length !== columnStyles.length) {
          setColumnStyles(currentStyles);
        }
      }
    }
  }, [data]);

  // Stil state'lerini senkronize et
  useEffect(() => {
    const currentStyles = [...columnStyles];
    while (currentStyles.length < tableData.headers.length) {
      currentStyles.push({ 
        backgroundColor: '#ffffff', 
        textColor: '#000000', 
        headerBackgroundColor: '#f3f4f6', 
        headerTextColor: '#000000' 
      });
    }
    
    if (currentStyles.length !== columnStyles.length) {
      setColumnStyles(currentStyles);
    }
  }, [tableData.headers.length]);

  const addColumn = () => {
    const newData = {
      headers: [...tableData.headers, `Başlık ${tableData.headers.length + 1}`],
      rows: tableData.rows.map(row => [...row, `Veri ${row.length + 1}`]),
      styles: [...columnStyles, { 
        backgroundColor: '#ffffff', 
        textColor: '#000000', 
        headerBackgroundColor: '#f3f4f6', 
        headerTextColor: '#000000' 
      }]
    };
    
    // Yeni sütun için varsayılan stil ekle
    const newStyles = [...columnStyles, { 
      backgroundColor: '#ffffff', 
      textColor: '#000000', 
      headerBackgroundColor: '#f3f4f6', 
      headerTextColor: '#000000' 
    }];
    
    setTableData(newData);
    setColumnStyles(newStyles);
    onChange(newData);
  };

  const addRow = () => {
    const newData = {
      headers: tableData.headers,
      rows: [...tableData.rows, Array(tableData.headers.length).fill('').map((_, index) => `Veri ${tableData.rows.length + 1}-${index + 1}`)],
      styles: columnStyles
    };
    setTableData(newData);
    onChange(newData);
  };

  const updateHeader = (columnIndex: number, value: string) => {
    const newData = {
      headers: tableData.headers.map((header, index) => index === columnIndex ? value : header),
      rows: tableData.rows,
      styles: columnStyles
    };
    setTableData(newData);
    onChange(newData);
  };

  const updateCell = (rowIndex: number, columnIndex: number, value: string) => {
    const newData = {
      headers: tableData.headers,
      rows: tableData.rows.map((row, rIndex) => 
        rIndex === rowIndex 
          ? row.map((cell, cIndex) => cIndex === columnIndex ? value : cell)
          : row
      ),
      styles: columnStyles
    };
    setTableData(newData);
    onChange(newData);
  };

  const removeColumn = (columnIndex: number) => {
    if (tableData.headers.length <= 1) return; // En az 1 sütun kalmalı
    
    const newStyles = columnStyles.filter((_, index) => index !== columnIndex);
    
    const newData = {
      headers: tableData.headers.filter((_, index) => index !== columnIndex),
      rows: tableData.rows.map(row => row.filter((_, index) => index !== columnIndex)),
      styles: newStyles
    };
    
    setTableData(newData);
    setColumnStyles(newStyles);
    onChange(newData);
  };

  const removeRow = (rowIndex: number) => {
    if (tableData.rows.length <= 1) return; // En az 1 satır kalmalı
    
    const newData = {
      headers: tableData.headers,
      rows: tableData.rows.filter((_, index) => index !== rowIndex),
      styles: columnStyles
    };
    setTableData(newData);
    onChange(newData);
  };

  const updateColumnStyle = (columnIndex: number, style: Partial<ColumnStyle>) => {
    const newStyles = columnStyles.map((colStyle, index) => 
      index === columnIndex ? { ...colStyle, ...style } : colStyle
    );
    setColumnStyles(newStyles);
    
    // Stil değişikliklerini de kaydet
    const newData = {
      ...tableData,
      styles: newStyles
    };
    onChange(newData);
  };

  const applyColorPreset = (columnIndex: number, preset: typeof colorPalette[0]) => {
    updateColumnStyle(columnIndex, {
      backgroundColor: preset.bg,
      textColor: preset.text,
      headerBackgroundColor: preset.headerBg,
      headerTextColor: preset.headerText
    });
  };

  return (
    <div className="simple-table-builder">
      <div className="flex gap-2 mb-4">
        <button
          onClick={addColumn}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          ➕ Sütun Ekle
        </button>
        <button
          onClick={addRow}
          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
        >
          ➕ Satır Ekle
        </button>
      </div>

      {/* Sütun Stil Kontrolleri */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Sütun Stilleri</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tableData.headers.map((header, columnIndex) => (
            <div key={columnIndex} className="space-y-2">
              <div className="text-xs font-medium text-gray-600">
                {header || `Sütun ${columnIndex + 1}`}
              </div>
              
              {/* Hızlı Renk Seçimi */}
              <div className="flex flex-wrap gap-1">
                {colorPalette.slice(0, 4).map((preset, presetIndex) => (
                  <button
                    key={presetIndex}
                    onClick={() => applyColorPreset(columnIndex, preset)}
                    className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-400"
                    style={{ backgroundColor: preset.bg }}
                    title={preset.name}
                  />
                ))}
              </div>
              
              {/* Özel Renk Seçimi */}
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>
                  <label className="block text-gray-500">Başlık</label>
                  <input
                    type="color"
                    value={columnStyles[columnIndex]?.headerBackgroundColor || '#f3f4f6'}
                    onChange={(e) => updateColumnStyle(columnIndex, { headerBackgroundColor: e.target.value })}
                    className="w-full h-6 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-gray-500">İçerik</label>
                  <input
                    type="color"
                    value={columnStyles[columnIndex]?.backgroundColor || '#ffffff'}
                    onChange={(e) => updateColumnStyle(columnIndex, { backgroundColor: e.target.value })}
                    className="w-full h-6 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <thead>
            <tr>
              {tableData.headers.map((header, columnIndex) => (
                <th 
                  key={columnIndex} 
                  className="border border-gray-300 p-2 relative"
                  style={{
                    backgroundColor: columnStyles[columnIndex]?.headerBackgroundColor || '#f3f4f6',
                    color: columnStyles[columnIndex]?.headerTextColor || '#000000'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => updateHeader(columnIndex, e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm bg-white/80 backdrop-blur-sm"
                      style={{
                        color: columnStyles[columnIndex]?.headerTextColor || '#000000'
                      }}
                    />
                    {tableData.headers.length > 1 && (
                      <button
                        onClick={() => removeColumn(columnIndex)}
                        className="text-red-500 hover:text-red-700 text-xs p-1 rounded hover:bg-red-50"
                        title="Sütunu Sil"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, columnIndex) => (
                  <td 
                    key={columnIndex} 
                    className="border border-gray-300 p-2"
                    style={{
                      backgroundColor: columnStyles[columnIndex]?.backgroundColor || '#ffffff',
                      color: columnStyles[columnIndex]?.textColor || '#000000'
                    }}
                  >
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, columnIndex, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white/60 backdrop-blur-sm"
                      style={{
                        color: columnStyles[columnIndex]?.textColor || '#000000'
                      }}
                    />
                  </td>
                ))}
                <td className="border border-gray-300 p-2 w-12 bg-gray-50">
                  {tableData.rows.length > 1 && (
                    <button
                      onClick={() => removeRow(rowIndex)}
                      className="text-red-500 hover:text-red-700 text-xs p-1 rounded hover:bg-red-50 w-full"
                      title="Satırı Sil"
                    >
                      ❌
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimpleTableBuilder;