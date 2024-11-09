import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { GHANA_COLORS } from "@/lib/constants";

export function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 
          className="text-4xl font-bold"
          style={{ color: GHANA_COLORS.red }}
        >
          Ghana Right to Information Portal
        </h1>
        
        <p className="text-xl text-muted-foreground">
          Access public information from Ghana government institutions easily and transparently
        </p>

        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
          style={{ color: GHANA_COLORS.green }}
        >
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Submit Request</h3>
            <p className="mb-4">File an RTI request with any government institution</p>
            <Link href="/requests">
              <Button className="w-full">Make Request</Button>
            </Link>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Track Status</h3>
            <p className="mb-4">Monitor the progress of your submitted requests</p>
            <Link href="/requests">
              <Button className="w-full">View Requests</Button>
            </Link>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Public Access</h3>
            <p className="mb-4">Browse publicly available information requests</p>
            <Link href="/requests">
              <Button className="w-full">Browse Requests</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
