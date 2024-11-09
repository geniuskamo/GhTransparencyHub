import { useUser } from "@/hooks/use-user";
import { useRequests } from "@/hooks/use-requests";
import { RequestForm } from "@/components/rti/request-form";
import { RequestList } from "@/components/rti/request-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { GHANA_COLORS } from "@/lib/constants";
import { RequestView } from "@/components/rti/request-view";

export function Requests() {
  const { user } = useUser();
  const { requests, isLoading, error } = useRequests();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  if (error) return <div>Failed to load requests</div>;
  if (isLoading) return <div>Loading...</div>;

  const filteredRequests = requests?.filter(request => 
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 
          className="text-2xl font-bold"
          style={{ color: GHANA_COLORS.red }}
        >
          RTI Requests
        </h1>
        {user && (
          <Button 
            onClick={() => setShowForm(!showForm)}
            style={{ 
              backgroundColor: showForm ? GHANA_COLORS.red : GHANA_COLORS.green 
            }}
          >
            {showForm ? "Cancel" : "New Request"}
          </Button>
        )}
      </div>

      {showForm && user && (
        <div className="mb-8">
          <RequestForm />
        </div>
      )}

      <div className="mb-6">
        <Input
          placeholder="Search requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {filteredRequests && filteredRequests.length > 0 ? (
        <div className="space-y-6">
          {filteredRequests.map(request => (
            <RequestView key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No requests found</p>
      )}
    </div>
  );
}
