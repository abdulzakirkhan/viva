// src/components/DataTable.jsx
import React, { useState } from "react";

const DataTable = ({
  columns = [],
  data = [],
  rowKey = "id",
  rowClassName,
  className = "",
}) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRowExpand = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  // For mobile view, we'll show a simplified version with expandable rows
  return (
    <>
      {/* Desktop Table */}
      <div className={`hidden md:block ${data.length > 5 ? "!h-[430px]" : ""} overflow-y-auto overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 backdrop-blur bg-white">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 text-left ${col.thClass || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row[rowKey] ?? idx}
                className={`border-t border-gray-200 ${rowClassName ? rowClassName(row) : ""}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm text-gray-700 align-middle ${col.tdClass || ""}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={columns.length}>
                 <p>No Data found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((row, idx) => (
          <div 
            key={row[rowKey] ?? idx} 
            className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${rowClassName ? rowClassName(row) : ""}`}
          >
            <div 
              className="p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleRowExpand(idx)}
            >
              <div className="flex-1">
                {/* Show first two columns as preview on mobile */}
                {columns.length > 0 && (
                  <div className="font-medium text-gray-900">
                    {columns[0].render ? columns[0].render(row) : row[columns[0].key]}
                  </div>
                )}
                {columns.length > 1 && (
                  <div className="text-sm text-gray-500 mt-1">
                    {columns[1].render ? columns[1].render(row) : row[columns[1].key]}
                  </div>
                )}
              </div>
              <svg 
                className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedRow === idx ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {expandedRow === idx && (
              <div className="px-4 pb-4 border-t border-gray-100">
                {columns.map((col, colIndex) => (
                  // Skip first two columns as they're already shown in the preview
                  colIndex > 1 && (
                    <div key={col.key} className="py-2 flex border-b border-gray-100 last:border-b-0">
                      <div className="w-1/3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                        {col.header}
                      </div>
                      <div className="w-2/3 text-sm text-gray-700">
                        {col.render ? col.render(row) : row[col.key]}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
        {data?.length === 0 && (
          <div>
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              <p>No Data found.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DataTable;