import { Link } from 'react-router-dom';

type Item = { label: string; path?: string };

export function Breadcrumb({ items }: { items: Item[] }) {
  return (
    <div style={{ marginBottom: 16, fontSize: 14 }}>
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span style={{ margin: '0 8px', color: '#718096' }}>/</span>}
          {item.path ? (
            <Link to={item.path} style={{ color: '#2E3192', textDecoration: 'none' }}>{item.label}</Link>
          ) : (
            <span style={{ color: '#4a5568' }}>{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
