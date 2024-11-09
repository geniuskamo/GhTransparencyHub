import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { REQUEST_STATUS } from "@/lib/constants";
import { Request } from "db/schema";
import { formatDistanceToNow, format } from "date-fns";
import { FileText, Eye } from "lucide-react";
import { SocialShare } from "./social-share";

interface RequestViewProps {
  request: Request;
}

export function RequestView({ request }: RequestViewProps) {
  const getFileNameFromUrl = (url: string) => {
    return url.split('/').pop() || 'document.pdf';
  };

  // Get the current URL for sharing
  const shareUrl = typeof window !== 'undefined' ? 
    `${window.location.origin}/requests/${request.id}` : 
    '';

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
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a 
                  href={request.documentUrl} 
                  download={getFileNameFromUrl(request.documentUrl)}
                  className="flex items-center"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Download
                </a>
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh]">
                  <iframe
                    src={`${request.documentUrl}#view=FitH`}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                </DialogContent>
              </Dialog>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              File: {getFileNameFromUrl(request.documentUrl)}
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>Submitted {formatDistanceToNow(new Date(request.createdAt))} ago</p>
          <p>Last updated {format(new Date(request.updatedAt), 'PPpp')}</p>
        </div>

        <div className="pt-4 border-t">
          <SocialShare
            title={`RTI Request: ${request.title}`}
            description={request.description}
            url={shareUrl}
          />
        </div>
      </CardContent>
    </Card>
  );
}
