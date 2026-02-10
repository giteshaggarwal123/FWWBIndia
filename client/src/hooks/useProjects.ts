import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get<{ _id: string; name: string; code?: string }[]>('/projects');
      return Array.isArray(res.data) ? res.data : [];
    },
  });
}
