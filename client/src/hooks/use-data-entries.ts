/**
 * DataEntry Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DataEntryService } from "@/api/dataEntryService";
import type { DataEntryRequest, DataEntryResponse } from "@/types/api";

const dataEntriesKey = (appId: string, screenId: string | number) =>
  ["dataEntries", appId, String(screenId)] as const;

export function useDataEntries(appId: string | undefined, screenId: string | undefined) {
  return useQuery<DataEntryResponse[]>({
    queryKey: appId && screenId ? dataEntriesKey(appId, screenId) : ["dataEntries", appId ?? "", screenId ?? ""] as const,
    queryFn: () => DataEntryService.getByScreen(appId!, screenId!),
    enabled: Boolean(appId && screenId),
  });
}

export function useCreateDataEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<DataEntryResponse, Error, { appId?: string; data: DataEntryRequest }>({
    mutationFn: ({ data }) => DataEntryService.create(data),
    onSuccess: (_, variables) => {
      if (variables.appId) {
        queryClient.invalidateQueries({
          queryKey: dataEntriesKey(variables.appId, variables.data.screenId),
        });
      }
      toast({ title: "Entrada registrada com sucesso" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao enviar formulário",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteDataEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, { id: string | number; appId: string; screenId: string | number }>({
    mutationFn: ({ id }) => DataEntryService.delete(String(id)),
    onSuccess: (_, { appId, screenId }) => {
      queryClient.invalidateQueries({
        queryKey: dataEntriesKey(appId, screenId),
      });
      toast({ title: "Entrada excluída" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao excluir entrada",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateDataEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    DataEntryResponse,
    Error,
    { id: string | number; appId: string; screenId: string | number; data: DataEntryRequest }
  >({
    mutationFn: ({ id, data }) => DataEntryService.update(String(id), data),
    onSuccess: (_, { appId, screenId }) => {
      queryClient.invalidateQueries({
        queryKey: dataEntriesKey(appId, screenId),
      });
      toast({ title: "Entrada atualizada" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao atualizar entrada",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}
