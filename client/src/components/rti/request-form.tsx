import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRequestSchema } from "db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function RequestForm() {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const form = useForm({
    resolver: zodResolver(insertRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      institutionId: 1
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("institutionId", data.institutionId.toString());
      
      if (selectedFile) {
        formData.append("document", selectedFile);
      }

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/requests", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          toast({
            title: "Success",
            description: "Request submitted successfully"
          });
          form.reset();
          setSelectedFile(null);
          setUploadProgress(0);
          setFileError(null);
        } else {
          const response = JSON.parse(xhr.responseText);
          toast({
            title: "Error",
            description: response.message || "Failed to submit request",
            variant: "destructive"
          });
        }
      };

      xhr.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to submit request",
          variant: "destructive"
        });
      };

      xhr.send(formData);
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
    setFileError(null);
    setSelectedFile(null);
    setUploadProgress(0);

    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError("Only PDF files are allowed");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }

    setSelectedFile(file);
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
            className="cursor-pointer"
          />
          {fileError && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{fileError}</AlertDescription>
            </Alert>
          )}
          {selectedFile && (
            <div className="text-sm text-muted-foreground mt-2">
              Selected file: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
            </div>
          )}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-2">
              <Progress value={uploadProgress} className="h-2" />
              <div className="text-sm text-muted-foreground mt-1">
                Uploading: {uploadProgress}%
              </div>
            </div>
          )}
        </FormItem>
        <Button 
          type="submit" 
          disabled={uploadProgress > 0 && uploadProgress < 100}
        >
          Submit Request
        </Button>
      </form>
    </Form>
  );
}
