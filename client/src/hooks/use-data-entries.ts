/**
 * DataEntry Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DataEntryService } from "@/api/dataEntryService";
import type { DataEntryRequest, DataEntryResponse } from "@/types/api";

const dataEntriesKey = (screenId: number) =>
  ["dataEntries", screenId] as const;

export function useDataEntries(screenId: number | undefined) {
  return useQuery<DataEntryResponse[]>({
    queryKey: dataEntriesKey(screenId ?? -1),
    queryFn: () => DataEntryService.getByScreen(screenId!),
    enabled: screenId !== undefined,
  });
}

export function useCreateDataEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<DataEntryResponse, Error, DataEntryRequest>({
    mutationFn: (data) => DataEntryService.create(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: dataEntriesKey(data.screenId),
      });
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

  return useMutation<void, Error, { id: number; screenId: number }>({
    mutationFn: ({ id }) => DataEntryService.delete(id),
    onSuccess: (_, { screenId }) => {
      queryClient.invalidateQueries({
        queryKey: dataEntriesKey(screenId),
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
    { id: number; screenId: number; data: DataEntryRequest }
  >({
    mutationFn: ({ id, data }) => DataEntryService.update(id, data),
    onSuccess: (_, { screenId }) => {
      queryClient.invalidateQueries({
        queryKey: dataEntriesKey(screenId),
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
