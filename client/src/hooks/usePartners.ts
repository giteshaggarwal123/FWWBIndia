import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function usePartners() {
  return useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const res = await api.get<{ _id: string; name: string; code?: string; type?: string; status?: string }[]>('/partners');
      return Array.isArray(res.data) ? res.data : [];
    },
  });
}
