/**
 * Screen Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ScreenService } from "@/api/screenService";
import type { ScreenRequest, ScreenResponse } from "@/types/api";

const SCREENS_KEY = ["screens"] as const;

export function useScreens(appId: string | undefined) {
  return useQuery<ScreenResponse[]>({
    queryKey: [...SCREENS_KEY, appId] as const,
    queryFn: () => ScreenService.getAll(appId),
    select: (screens) =>
      appId
        ? screens.filter((s) => s.appEntityId === appId || s.appId === appId)
        : screens,
  });
}

export function useScreen(id: string | undefined) {
  return useQuery<ScreenResponse>({
    queryKey: ["screens", id] as const,
    queryFn: () => ScreenService.getById(id!),
    enabled: id !== undefined,
  });
}

export function useCreateScreen() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ScreenResponse, Error, ScreenRequest>({
    mutationFn: (data) => ScreenService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCREENS_KEY });
      toast({ title: "Tela criada" });
    },
    onError: (err) => {
      toast({ title: "Erro ao criar tela", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateScreen() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, { id: string; data: ScreenRequest }>({
    mutationFn: ({ id, data }) => ScreenService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCREENS_KEY });
      toast({ title: "Tela atualizada" });
    },
    onError: (err) => {
      toast({ title: "Erro ao atualizar tela", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteScreen() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, { id: string; appId: string }>({
    mutationFn: ({ id }) => ScreenService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCREENS_KEY });
      toast({ title: "Tela excluída" });
    },
    onError: (err) => {
      toast({ title: "Erro ao excluir tela", description: err.message, variant: "destructive" });
    },
  });
}
