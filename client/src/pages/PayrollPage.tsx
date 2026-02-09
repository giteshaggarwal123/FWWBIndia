import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Breadcrumb } from '../components/Breadcrumb';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

type PayrollRun = {
  _id: string;
  month: number;
  year: number;
  totalAmount: number;
  payslipCount: number;
  status: string;
  processedAt?: string;
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function PayrollPage() {
  const [modal, setModal] = useState(false);
  const queryClient = useQueryClient();
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['payroll'],
    queryFn: async () => {
      const res = await api.get<PayrollRun[]>('/payroll');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/payroll', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payroll'] }); setModal(false); },
  });
  const processMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/payroll/${id}`, { status: 'processed', processedAt: new Date() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll'] }),
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Payroll' }]} />
      <div style={{ marginBottom: 24 }}>
        <button type="button" onClick={() => setModal(true)} style={{ padding: '10px 16px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ New Payroll Run</button>
      </div>
      <DataTable<PayrollRun>
        keyField="_id"
        data={list}
        loading={isLoading}
        columns={[
          { key: 'month', label: 'Month', render: (r) => `${MONTHS[r.month - 1]} ${r.year}` },
          { key: 'totalAmount', label: 'Total (₹)', render: (r) => `₹${Number(r.totalAmount).toLocaleString()}` },
          { key: 'payslipCount', label: 'Payslips' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          { key: 'processedAt', label: 'Processed', render: (r) => r.processedAt ? new Date(r.processedAt).toLocaleString() : '-' },
        ]}
        actions={(row) => (
          <span>
            {row.status === 'draft' && <button type="button" onClick={() => processMutation.mutate(row._id)} style={{ color: '#276749', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Mark Processed</button>}
          </span>
        )}
      />
      {modal && (
        <Modal title="New Payroll Run" onClose={() => setModal(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const month = (form.querySelector('[name="month"]') as HTMLSelectElement)?.value;
              const year = (form.querySelector('[name="year"]') as HTMLInputElement)?.value;
              const totalAmount = (form.querySelector('[name="totalAmount"]') as HTMLInputElement)?.value;
              const payslipCount = (form.querySelector('[name="payslipCount"]') as HTMLInputElement)?.value;
              if (!month || !year) return;
              createMutation.mutate({
                month: Number(month),
                year: Number(year),
                totalAmount: Number(totalAmount) || 0,
                payslipCount: Number(payslipCount) || 0,
                status: 'draft',
              });
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label>Month * <select name="month" required style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }}>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select></label>
            <label>Year * <input name="year" type="number" required defaultValue={new Date().getFullYear()} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Total Amount (₹) <input name="totalAmount" type="number" defaultValue={0} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <label>Payslip Count <input name="payslipCount" type="number" defaultValue={0} style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} /></label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={createMutation.isPending} style={{ padding: '10px 20px', background: '#2E3192', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{createMutation.isPending ? 'Saving...' : 'Create'}</button>
              <button type="button" onClick={() => setModal(false)} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
