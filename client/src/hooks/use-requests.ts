import useSWR from "swr";
import type { Request } from "db/schema";

export function useRequests() {
  const { data, error, mutate } = useSWR<Request[]>("/api/requests");

  return {
    requests: data,
    isLoading: !error && !data,
    error,
    mutate
  };
}
