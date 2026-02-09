import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export type UserOption = { _id: string; name: string; username: string };

export function useUsers() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get<UserOption[]>('/users');
      return res.data;
    },
  });
  return { data: data as UserOption[], isLoading };
}
