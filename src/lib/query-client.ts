import {
  MutationCache,
  QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      if (!mutation.meta?.successMessage) return;
      toast.success(mutation.meta.successMessage);
    },
    onError: (data, _variables, _context, mutation) => {
      if (data instanceof AxiosError) {
        const apiErrorMessage = data?.response?.data?.message;

        if (apiErrorMessage) {
          toast.error(apiErrorMessage);
          return;
        }
      }
      if (!mutation.meta?.errorMessage) return;
      toast.error(mutation.meta.errorMessage);
    },
    onSettled: (_data, _error, _variables, _context, mutation) => {
      const keys = mutation.meta?.invalidateQuery;
      if (!keys) return;

      const keyList = Array.isArray(keys?.[0]) ? keys : [keys];

      keyList.forEach((queryKey: unknown) => {
        queryClient.invalidateQueries({ queryKey: queryKey as QueryKey });
      });
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        if (error instanceof AxiosError && error.response?.status === 401) {
          // No retry for 401
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});
