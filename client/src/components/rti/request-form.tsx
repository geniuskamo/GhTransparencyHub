import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRequestSchema } from "db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";

export function RequestForm() {
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(insertRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      institutionId: 1
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        body: data
      });
      
      if (!response.ok) throw new Error("Failed to submit request");
      
      toast({
        title: "Success",
        description: "Request submitted successfully"
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Error",
        description: "Only PDF files are allowed",
        variant: "destructive"
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive"
      });
      return;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Request Title</FormLabel>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <Textarea {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Supporting Document (PDF)</FormLabel>
          <Input 
            type="file" 
            accept=".pdf"
            onChange={handleFileChange}
          />
        </FormItem>
        <Button type="submit">Submit Request</Button>
      </form>
    </Form>
  );
}
