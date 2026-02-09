type Column<T> = { key: keyof T | string; label: string; render?: (row: T) => React.ReactNode };

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T | string;
  loading?: boolean;
  actions?: (row: T) => React.ReactNode;
};

export function DataTable<T extends Record<string, unknown>>({ columns, data, keyField, loading, actions }: Props<T>) {
  const getVal = (row: T, key: keyof T | string) => {
    const k = key as keyof T;
    return row[k] as unknown;
  };

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      {loading && (
        <div style={{ padding: 24, textAlign: 'center', color: '#718096' }}>Loading...</div>
      )}
      {!loading && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7fafc', borderBottom: '1px solid #e2e8f0' }}>
              {columns.map((col) => (
                <th key={String(col.key)} style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#4a5568' }}>
                  {col.label}
                </th>
              ))}
              {actions && <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} style={{ padding: 24, textAlign: 'center', color: '#718096' }}>
                  No data
                </td>
              </tr>
            )}
            {data.map((row, i) => (
              <tr key={String(getVal(row, keyField)) || i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                {columns.map((col) => (
                  <td key={String(col.key)} style={{ padding: 12, fontSize: 14 }}>
                    {col.render ? col.render(row) : String(getVal(row, col.key) ?? '')}
                  </td>
                ))}
                {actions && (
                  <td style={{ padding: 12 }}>
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
