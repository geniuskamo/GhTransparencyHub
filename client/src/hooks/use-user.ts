import useSWR from "swr";
import type { User, InsertUser } from "db/schema";
import { useToast } from "@/hooks/use-toast";

export function useUser() {
  const { toast } = useToast();
  const { data, error, mutate } = useSWR<User, Error>("/api/user", {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    onError: (err) => {
      if (err.message !== "Unauthorized") {
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          variant: "destructive",
        });
      }
    },
  });

  return {
    user: data,
    isLoading: !error && !data,
    error,
    login: async (user: InsertUser) => {
      try {
        const res = await handleRequest("/login", "POST", user);
        if (res.ok) {
          // Wait for the mutation to complete
          await mutate(undefined, {
            optimisticData: undefined,
            rollbackOnError: true,
            revalidate: true,
          });
        }
        return res;
      } catch (error) {
        console.error("Login error:", error);
        return { 
          ok: false, 
          message: error instanceof Error ? error.message : "Login failed" 
        };
      }
    },
    logout: async () => {
      try {
        const res = await handleRequest("/logout", "POST");
        // Immediately clear the cache on logout
        await mutate(undefined, { 
          optimisticData: undefined,
          revalidate: false 
        });
        return res;
      } catch (error) {
        console.error("Logout error:", error);
        return { 
          ok: false, 
          message: error instanceof Error ? error.message : "Logout failed" 
        };
      }
    },
    register: async (user: InsertUser) => {
      try {
        const res = await handleRequest("/register", "POST", user);
        if (res.ok) {
          // Wait for the mutation to complete
          await mutate(undefined, {
            optimisticData: undefined,
            rollbackOnError: true,
            revalidate: true,
          });
        }
        return res;
      } catch (error) {
        console.error("Registration error:", error);
        return { 
          ok: false, 
          message: error instanceof Error ? error.message : "Registration failed" 
        };
      }
    },
  };
}

type RequestResult =
  | {
      ok: true;
      user?: User;
    }
  | {
      ok: false;
      message: string;
    };

async function handleRequest(
  url: string,
  method: string,
  body?: InsertUser
): Promise<RequestResult> {
  try {
    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, message: data.message || "Request failed" };
    }

    return { ok: true, user: data.user };
  } catch (e: any) {
    console.error("Request error:", e);
    return { ok: false, message: e.message || "Network error occurred" };
  }
}
