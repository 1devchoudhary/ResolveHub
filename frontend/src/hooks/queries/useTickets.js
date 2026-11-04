import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { agentsApi, categoriesApi, ticketsApi } from '../../api/tickets';

// One place for cache keys, so invalidation can't drift out of sync with the queries
export const ticketKeys = {
  all: ['tickets'],
  lists: () => [...ticketKeys.all, 'list'],
  list: (params) => [...ticketKeys.lists(), params],
  detail: (number) => [...ticketKeys.all, 'detail', number],
  stats: () => [...ticketKeys.all, 'stats'],
  activity: () => [...ticketKeys.all, 'activity'],
};

// Polling stands in for realtime: cheap, and it works on serverless (no sockets)
const LIST_POLL_MS = 30_000;
const DETAIL_POLL_MS = 10_000;

export const useTickets = (params, options = {}) =>
  useQuery({
    queryKey: ticketKeys.list(params),
    queryFn: () => ticketsApi.list(params),
    // Keep showing the current page while the next one loads (no flicker on paging/filtering)
    placeholderData: keepPreviousData,
    refetchInterval: LIST_POLL_MS,
    ...options,
  });

export const useTicket = (number) =>
  useQuery({
    queryKey: ticketKeys.detail(number),
    queryFn: () => ticketsApi.get(number),
    refetchInterval: DETAIL_POLL_MS,
    enabled: Boolean(number),
  });

export const useTicketStats = () =>
  useQuery({
    queryKey: ticketKeys.stats(),
    queryFn: ticketsApi.stats,
    refetchInterval: LIST_POLL_MS,
  });

export const useTicketActivity = (limit) =>
  useQuery({
    queryKey: [...ticketKeys.activity(), limit],
    queryFn: () => ticketsApi.activity(limit),
    refetchInterval: LIST_POLL_MS,
  });

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list, staleTime: 5 * 60_000 });

export const useAgents = (options = {}) =>
  useQuery({ queryKey: ['agents'], queryFn: agentsApi.list, staleTime: 60_000, ...options });

// After any change: put the fresh ticket straight into the cache (no refetch needed for the
// detail page) and mark lists/stats stale so they refresh in the background
const useTicketMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (ticket) => {
      // A poll that started before this change could land afterwards and overwrite the fresh
      // ticket with stale data, so cancel it first
      await queryClient.cancelQueries({ queryKey: ticketKeys.detail(ticket.number) });
      queryClient.setQueryData(ticketKeys.detail(ticket.number), ticket);
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.stats() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.activity() });
    },
  });
};

export const useCreateTicket = () => useTicketMutation(ticketsApi.create);

export const useReplyToTicket = (number) =>
  useTicketMutation((input) => ticketsApi.reply(number, input));

export const useUpdateTicket = (number) =>
  useTicketMutation((changes) => ticketsApi.update(number, changes));
