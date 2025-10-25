import { QueryKey } from "@tanstack/react-query";
declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      invalidateQuery?: QueryKey;
      successMessage?: string;
      errorMessage?: string;
    };
  }
}
