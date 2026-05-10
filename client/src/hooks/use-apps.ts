/**
 * AppEntity Hooks (Apps)
 * Uses new Axios API service layer for .NET 9 backend
 * TODO: Verify exact endpoint paths in flexa.Api\Controllers\AppEntityController.cs
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AppEntityService } from "@/api/appEntityService";
import type { AppEntityRequest, AppEntityResponse } from "@/types/api";

// Query key constants
const QUERY_KEY_APP_ENTITIES = ["appEntities"];

export function useApps() {
  return useQuery({
    queryKey: QUERY_KEY_APP_ENTITIES,
    queryFn: async () => {
      return AppEntityService.getAll();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useApp(id: number | string) {
  return useQuery({
    queryKey: ["appEntities", id],
    enabled: !!id,
    queryFn: async () => {
      return AppEntityService.getById(Number(id));
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateApp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AppEntityRequest) => {
      return AppEntityService.create(data);
    },
    onSuccess: () => {
      // Invalidate the list to trigger re-fetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_APP_ENTITIES });
      toast({ title: "Success", description: "App created successfully" });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to create app";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateApp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AppEntityRequest }) => {
      return AppEntityService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_APP_ENTITIES });
      queryClient.invalidateQueries({ queryKey: ["appEntities", id] });
      toast({ title: "Success", description: "App updated successfully" });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to update app";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteApp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      return AppEntityService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_APP_ENTITIES });
      toast({ title: "Success", description: "App deleted successfully" });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to delete app";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}
