import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REQUEST_STATUS } from "@/lib/constants";
import { Request } from "db/schema";
import { formatDistanceToNow } from "date-fns";
import { FileText } from "lucide-react";

interface RequestViewProps {
  request: Request;
}

export function RequestView({ request }: RequestViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{request.title}</CardTitle>
          <Badge variant={
            request.status === "completed" ? "success" :
            request.status === "rejected" ? "destructive" :
            "secondary"
          }>
            {REQUEST_STATUS[request.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground">{request.description}</p>
        </div>
        
        {request.documentUrl && (
          <div>
            <h3 className="font-semibold mb-2">Supporting Document</h3>
            <Button variant="outline" asChild>
              <a href={request.documentUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 h-4 w-4" />
                View Document
              </a>
            </Button>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>Submitted {formatDistanceToNow(new Date(request.createdAt))} ago</p>
          <p>Last updated {formatDistanceToNow(new Date(request.updatedAt))} ago</p>
        </div>
      </CardContent>
    </Card>
  );
}
