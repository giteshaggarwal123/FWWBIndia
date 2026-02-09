const statusStyles: Record<string, { bg: string; color: string }> = {
  active: { bg: '#c6f6d5', color: '#276749' },
  pending: { bg: '#feebc8', color: '#c05621' },
  approved: { bg: '#c6f6d5', color: '#276749' },
  rejected: { bg: '#fed7d7', color: '#c53030' },
  completed: { bg: '#bee3f8', color: '#2b6cb0' },
  planned: { bg: '#e9d8fd', color: '#553c9a' },
  'in-progress': { bg: '#bee3f8', color: '#2b6cb0' },
  delayed: { bg: '#fed7d7', color: '#c53030' },
  submitted: { bg: '#feebc8', color: '#c05621' },
  verified: { bg: '#c6f6d5', color: '#276749' },
  settled: { bg: '#c6f6d5', color: '#276749' },
  fulfilled: { bg: '#c6f6d5', color: '#276749' },
  sent: { bg: '#bee3f8', color: '#2b6cb0' },
  draft: { bg: '#e2e8f0', color: '#4a5568' },
  processed: { bg: '#c6f6d5', color: '#276749' },
  present: { bg: '#c6f6d5', color: '#276749' },
  absent: { bg: '#fed7d7', color: '#c53030' },
  leave: { bg: '#feebc8', color: '#c05621' },
  'half-day': { bg: '#e9d8fd', color: '#553c9a' },
  wfh: { bg: '#bee3f8', color: '#2b6cb0' },
  closed: { bg: '#e2e8f0', color: '#4a5568' },
};

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || { bg: '#e2e8f0', color: '#4a5568' };
  return (
    <span
      style={{
        padding: '4px 10px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        background: style.bg,
        color: style.color,
      }}
    >
      {status.replace('-', ' ')}
    </span>
  );
}
