import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/use-analytics";
import { GHANA_COLORS, REQUEST_STATUS } from "@/lib/constants";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from "recharts";
import { useMemo } from "react";
import { type Request } from "db/schema";

type RequestStatusType = typeof REQUEST_STATUS;
type RequestStatusKey = keyof RequestStatusType;

function AnalyticsContent() {
  const { analytics, isLoading, error } = useAnalytics();

  if (error) return <div>Failed to load analytics</div>;
  if (isLoading) return <div>Loading...</div>;

  const statusData = useMemo(() => 
    analytics?.statusCounts.map(({ status, count }) => ({
      name: REQUEST_STATUS[status as RequestStatusKey],
      value: count
    })) ?? [], [analytics?.statusCounts]
  );

  const timeData = useMemo(() => 
    analytics?.requestsOverTime.map(({ date, count }) => ({
      date: new Date(date).toLocaleDateString(),
      requests: count
    })) ?? [], [analytics?.requestsOverTime]
  );

  const COLORS = [
    GHANA_COLORS.red,
    GHANA_COLORS.gold,
    GHANA_COLORS.green,
    "#999999"
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ErrorBoundary>
        <Card>
          <CardHeader>
            <CardTitle>Request Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {statusData?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>

      <ErrorBoundary>
        <Card>
          <CardHeader>
            <CardTitle>Average Processing Time</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <div className="text-5xl font-bold" style={{ color: GHANA_COLORS.green }}>
                {analytics?.avgProcessingTime ?? 0}
              </div>
              <div className="text-muted-foreground mt-2">Hours</div>
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>

      <ErrorBoundary>
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Requests Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="requests"
                    stroke={GHANA_COLORS.green}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>

      <ErrorBoundary>
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Institution Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics?.institutionStats}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="institutionId" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalRequests" fill={GHANA_COLORS.gold} name="Total Requests" />
                  <Bar dataKey="completedRequests" fill={GHANA_COLORS.green} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>
    </div>
  );
}

export function AnalyticsDashboard() {
  return (
    <ErrorBoundary>
      <AnalyticsContent />
    </ErrorBoundary>
  );
}
