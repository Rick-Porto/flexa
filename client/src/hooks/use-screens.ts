/**
 * Screen Hooks
 * Uses new Axios API service layer for .NET 9 backend
 * TODO: Verify exact endpoint paths in flexa.Api\Controllers\ScreenController.cs
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ScreenService } from "@/api/screenService";
import type { ScreenRequest, ScreenResponse } from "@/types/api";

export function useScreens(appEntityId: number | string) {
  return useQuery({
    queryKey: ["screens", appEntityId],
    enabled: !!appEntityId,
    queryFn: async () => {
      return ScreenService.getAllForApp(Number(appEntityId));
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useScreen(id: number | string) {
  return useQuery({
    queryKey: ["screens", id],
    enabled: !!id,
    queryFn: async () => {
      return ScreenService.getById(Number(id));
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateScreen() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ appEntityId, data }: { appEntityId: number; data: ScreenRequest }) => {
      return ScreenService.create(data);
    },
    onSuccess: (_, { appEntityId }) => {
      queryClient.invalidateQueries({ queryKey: ["screens", appEntityId] });
      toast({ title: "Success", description: "Screen created successfully" });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to create screen";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateScreen() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ScreenRequest }) => {
      return ScreenService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["screens"] });
      queryClient.invalidateQueries({ queryKey: ["screens", id] });
      toast({ title: "Success", description: "Screen updated successfully" });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to update screen";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteScreen() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, appEntityId }: { id: number; appEntityId: number }) => {
      return ScreenService.delete(id);
    },
    onSuccess: (_, { appEntityId }) => {
      queryClient.invalidateQueries({ queryKey: ["screens", appEntityId] });
      toast({ title: "Success", description: "Screen deleted successfully" });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to delete screen";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}
