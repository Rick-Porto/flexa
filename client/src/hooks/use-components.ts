/**
 * Component Hooks
 * Uses new Axios API service layer for .NET 9 backend
 * TODO: Verify exact endpoint paths in flexa.Api\Controllers\ComponentController.cs
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ComponentService } from "@/api/componentService";
import type { ComponentRequest, ComponentResponse } from "@/types/api";

export function useComponents(screenId: number | string) {
  return useQuery({
    queryKey: ["components", screenId],
    enabled: !!screenId,
    queryFn: async () => {
      return ComponentService.getAllForScreen(Number(screenId));
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useComponent(id: number | string) {
  return useQuery({
    queryKey: ["components", id],
    enabled: !!id,
    queryFn: async () => {
      return ComponentService.getById(Number(id));
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateComponent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ screenId, data }: { screenId: number; data: ComponentRequest }) => {
      return ComponentService.create(data);
    },
    onSuccess: (_, { screenId }) => {
      queryClient.invalidateQueries({ queryKey: ["components", screenId] });
      toast({ title: "Success", description: "Component added" });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to create component";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateComponent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, screenId, data }: { id: number; screenId: number; data: ComponentRequest }) => {
      return ComponentService.update(id, data);
    },
    onSuccess: (_, { screenId }) => {
      queryClient.invalidateQueries({ queryKey: ["components", screenId] });
      toast({ title: "Saved", description: "Component updated" });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to update component";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteComponent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, screenId }: { id: number; screenId: number }) => {
      return ComponentService.delete(id);
    },
    onSuccess: (_, { screenId }) => {
      queryClient.invalidateQueries({ queryKey: ["components", screenId] });
      toast({ title: "Removed", description: "Component deleted" });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to delete component";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}
