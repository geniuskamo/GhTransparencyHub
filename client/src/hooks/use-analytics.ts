import useSWR from "swr";

interface AnalyticsData {
  statusCounts: Array<{
    status: string;
    count: number;
  }>;
  avgProcessingTime: number;
  requestsOverTime: Array<{
    date: string;
    count: number;
  }>;
  institutionStats: Array<{
    institutionId: number;
    totalRequests: number;
    completedRequests: number;
  }>;
}

export function useAnalytics() {
  const { data, error, mutate } = useSWR<AnalyticsData>("/api/analytics");

  return {
    analytics: data,
    isLoading: !error && !data,
    error,
    mutate
  };
}
