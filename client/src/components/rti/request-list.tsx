import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { REQUEST_STATUS } from "@/lib/constants";
import { Request } from "db/schema";
import { formatDistanceToNow } from "date-fns";

interface RequestListProps {
  requests: Request[];
}

export function RequestList({ requests }: RequestListProps) {
  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{request.title}</CardTitle>
              <Badge variant={
                request.status === "completed" ? "success" :
                request.status === "rejected" ? "destructive" :
                "secondary"
              }>
                {REQUEST_STATUS[request.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              {request.description}
            </p>
            <div className="text-xs text-muted-foreground">
              Submitted {formatDistanceToNow(new Date(request.createdAt))} ago
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
