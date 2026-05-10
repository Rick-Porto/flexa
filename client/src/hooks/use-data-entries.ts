/**
 * DataEntry Hooks
 * Uses new Axios API service layer for .NET 9 backend
 * TODO: Verify exact endpoint paths in flexa.Api\Controllers\DataEntryController.cs
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DataEntryService } from "@/api/dataEntryService";
import type { DataEntryRequest, DataEntryResponse } from "@/types/api";

export function useDataEntriesForScreen(screenId: number | string) {
  return useQuery({
    queryKey: ["dataEntries", "screen", screenId],
    enabled: !!screenId,
    queryFn: async () => {
      return DataEntryService.getAllForScreen(Number(screenId));
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

export function useDataEntriesForComponent(componentId: number | string) {
  return useQuery({
    queryKey: ["dataEntries", "component", componentId],
    enabled: !!componentId,
    queryFn: async () => {
      return DataEntryService.getAllForComponent(Number(componentId));
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

export function useDataEntry(id: number | string) {
  return useQuery({
    queryKey: ["dataEntries", id],
    enabled: !!id,
    queryFn: async () => {
      return DataEntryService.getById(Number(id));
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateDataEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: DataEntryRequest) => {
      return DataEntryService.create(data);
    },
    onSuccess: (_, data) => {
      // Invalidate relevant data entry queries
      if (data.screenId) {
        queryClient.invalidateQueries({ queryKey: ["dataEntries", "screen", data.screenId] });
      }
      if (data.componentId) {
        queryClient.invalidateQueries({ queryKey: ["dataEntries", "component", data.componentId] });
      }
      toast({ title: "Success", description: "Data entry submitted successfully" });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to submit entry";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateDataEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DataEntryRequest }) => {
      return DataEntryService.update(id, data);
    },
    onSuccess: (_, { data }) => {
      if (data.screenId) {
        queryClient.invalidateQueries({ queryKey: ["dataEntries", "screen", data.screenId] });
      }
      if (data.componentId) {
        queryClient.invalidateQueries({ queryKey: ["dataEntries", "component", data.componentId] });
      }
      toast({ title: "Success", description: "Data entry updated successfully" });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to update entry";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteDataEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      return DataEntryService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dataEntries"] });
      toast({ title: "Success", description: "Data entry deleted successfully" });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to delete entry";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}
