import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface CounterData {
  counter: number;
}

// Hook para datos iniciales
export function useCounter() {
  return useQuery({
    queryKey: ["counter"],
    queryFn: async (): Promise<CounterData> => {
      const response = await fetch("/api/counter");
      if (!response.ok) {
        throw new Error("Failed to fetch counter");
      }
      return response.json();
    },
    staleTime: 0, // Siempre fresh
  });
}

// Hook para suscripción SSE
export function useCounterSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = new EventSource("/api/sse");

    eventSource.onmessage = (event) => {
      try {
        const data: CounterData = JSON.parse(event.data);
        // Actualizar cache de TanStack Query
        queryClient.setQueryData(["counter"], data);
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
    };

    // Cleanup
    return () => {
      eventSource.close();
    };
  }, [queryClient]);
}

// Hook combinado
export function useRealtimeCounter() {
  const { data, isLoading, error } = useCounter();
  useCounterSubscription(); // Suscripción SSE

  return {
    counter: data?.counter ?? 0,
    isLoading,
    error,
  };
}
