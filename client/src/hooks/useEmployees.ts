import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useEmployees() {
  return useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const res = await api.get<{ _id: string; employeeId: string; name: string }[]>('/employees');
      return res.data;
    },
  });
}
