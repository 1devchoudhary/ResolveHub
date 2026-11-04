import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { categoriesApi } from '../../api/tickets';

export const adminKeys = {
  analytics: (days) => ['admin', 'analytics', days],
  users: (params) => ['admin', 'users', params],
};

export const useAnalytics = (days) =>
  useQuery({
    queryKey: adminKeys.analytics(days),
    queryFn: () => adminApi.analytics(days),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  });

export const useUsers = (params) =>
  useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => adminApi.users(params),
    placeholderData: keepPreviousData,
  });

// Team changes affect user lists, the agent pickers and analytics
const useAdminMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};

export const useCreateStaff = () => useAdminMutation(adminApi.createStaff);

export const useUpdateUser = () =>
  useAdminMutation(({ id, ...changes }) => adminApi.updateUser(id, changes));

const useCategoryMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
};

export const useCreateCategory = () => useCategoryMutation(categoriesApi.create);

export const useUpdateCategory = () =>
  useCategoryMutation(({ id, ...changes }) => categoriesApi.update(id, changes));
