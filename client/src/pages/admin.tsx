import { useRequests } from "@/hooks/use-requests";
import { useUser } from "@/hooks/use-user";
import { RequestView } from "@/components/rti/request-view";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GHANA_COLORS } from "@/lib/constants";
import { useLocation } from "wouter";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Admin() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const { requests, isLoading, error, mutate } = useRequests();
  const { toast } = useToast();

  if (!user || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  if (error) return <div>Failed to load requests</div>;
  if (isLoading) return <div>Loading...</div>;

  const updateStatus = async (requestId: number, status: string) => {
    try {
      const response = await fetch(`/api/requests/${requestId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast({
        title: "Success",
        description: "Request status updated"
      });

      mutate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 
        className="text-2xl font-bold mb-8"
        style={{ color: GHANA_COLORS.red }}
      >
        Admin Dashboard
      </h1>

      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="requests">Manage Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <div className="space-y-6">
            {requests?.map((request) => (
              <div key={request.id} className="border rounded-lg p-6">
                <RequestView request={request} />
                
                <div className="mt-4 flex items-center gap-4">
                  <Select
                    value={request.status}
                    onValueChange={(value) => updateStatus(request.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Download document logic
                    }}
                  >
                    Download Documents
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
