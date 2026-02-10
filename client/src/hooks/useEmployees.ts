import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useEmployees() {
  return useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const res = await api.get<{ _id: string; employeeId: string; name: string }[] | { data: { _id: string; employeeId: string; name: string }[]; total: number }>('/employees');
      const d = res.data;
      if (Array.isArray(d)) return d;
      if (d && typeof d === 'object' && 'data' in d && Array.isArray((d as { data: unknown[] }).data)) return (d as { data: { _id: string; employeeId: string; name: string }[] }).data;
      return [];
    },
  });
}
