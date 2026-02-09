import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useDonors() {
  return useQuery({
    queryKey: ['donors'],
    queryFn: async () => {
      const res = await api.get<{ _id: string; name: string; code?: string }[]>('/donors');
      return Array.isArray(res.data) ? res.data : [];
    },
  });
}
