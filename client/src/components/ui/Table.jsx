import { HiOutlineChevronUp, HiOutlineChevronDown } from 'react-icons/hi';

const Table = ({
  columns = [],
  data = [],
  onSort,
  sortField,
  sortOrder,
  loading = false,
  emptyMessage = 'No records found',
  className = '',
}) => {
  return (
    <div className={`w-full overflow-hidden border border-gray-100 dark:border-dark-700 rounded-2xl ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-dark-800 border-b border-gray-100 dark:border-dark-700">
              {columns.map((col) => (
                <th
                  key={col.field}
                  onClick={() => col.sortable && onSort && onSort(col.field)}
                  className={`py-4 px-5 text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer hover:text-dark-800 dark:hover:text-white transition-colors' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && sortField === col.field && (
                      sortOrder === 'asc' ? <HiOutlineChevronUp className="w-3.5 h-3.5" /> : <HiOutlineChevronDown className="w-3.5 h-3.5" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-700/50">
            {loading ? (
              Array.from({ length: 3 }).map((_, rIndex) => (
                <tr key={rIndex} className="animate-pulse">
                  {columns.map((_, cIndex) => (
                    <td key={cIndex} className="py-4 px-5">
                      <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-sm text-gray-500 dark:text-dark-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rIndex) => (
                <tr
                  key={row._id || row.id || rIndex}
                  className="hover:bg-gray-50 dark:hover:bg-dark-800/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.field} className="py-4 px-5 text-sm text-dark-800 dark:text-dark-200">
                      {col.render ? col.render(row[col.field], row) : row[col.field]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
