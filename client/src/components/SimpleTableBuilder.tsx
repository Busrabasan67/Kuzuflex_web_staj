import React, { useState } from 'react';

interface TableData {
  headers: string[];
  rows: string[][];
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

  const addColumn = () => {
    const newData = {
      headers: [...tableData.headers, `Başlık ${tableData.headers.length + 1}`],
      rows: tableData.rows.map(row => [...row, `Veri ${row.length + 1}`])
    };
    setTableData(newData);
    onChange(newData);
  };

  const addRow = () => {
    const newData = {
      headers: tableData.headers,
      rows: [...tableData.rows, Array(tableData.headers.length).fill('').map((_, index) => `Veri ${tableData.rows.length + 1}-${index + 1}`)]
    };
    setTableData(newData);
    onChange(newData);
  };

  const updateHeader = (columnIndex: number, value: string) => {
    const newData = {
      headers: tableData.headers.map((header, index) => index === columnIndex ? value : header),
      rows: tableData.rows
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
      )
    };
    setTableData(newData);
    onChange(newData);
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

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              {tableData.headers.map((header, columnIndex) => (
                <th key={columnIndex} className="border border-gray-300 p-2">
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => updateHeader(columnIndex, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, columnIndex) => (
                  <td key={columnIndex} className="border border-gray-300 p-2">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, columnIndex, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimpleTableBuilder;