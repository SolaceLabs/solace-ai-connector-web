import React, { useMemo } from 'react';

export const CsvPreviewPanel: React.FC<{content: string; width: number}> = ({ content, width }) => {
    const rows = useMemo(() => {
      try {
        const lines = content.trim().split('\n');
        const parsed = lines
          .filter(line => line.trim())
          .map(line => line.split(',').map(cell => cell.trim()));
        
        return parsed;
      } catch (e) {
        return [];
      }
    }, [content]);
  
    if (!rows.length) {
      return <div className="text-gray-500 dark:text-gray-400">No valid CSV content found</div>;
    }
  
    return (
      <div 
        className="overflow-x-auto scrollbar-themed" 
        style={{ maxWidth: `${width}px`, maxHeight: 'calc(100vh - 200px)' }}
      >
        <table className="min-w-full text-sm dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
            {rows.length > 0 && (
              <tr>
                {rows[0].map((header, i) => (
                  <th key={i} className="border border-gray-200 dark:border-gray-600 p-2 font-medium text-left dark:text-white">
                    {header}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {rows.slice(1).map((row, i) => (
              <tr 
                key={i} 
                className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}
              >
                {row.map((cell, j) => (
                  <td 
                    key={j} 
                    className="border border-gray-200 dark:border-gray-600 p-2 truncate dark:text-white"
                    title={cell}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };