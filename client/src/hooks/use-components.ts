/**
 * Component Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ComponentService } from "@/api/componentService";
import type { ComponentRequest, ComponentResponse } from "@/types/api";

const componentsKey = (screenId: number) => ["components", screenId] as const;

export function useComponents(screenId: number | undefined) {
  return useQuery<ComponentResponse[]>({
    queryKey: componentsKey(screenId ?? -1),
    queryFn: () => ComponentService.getByScreen(screenId!),
    enabled: screenId !== undefined,
  });
}

export function useCreateComponent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ComponentResponse, Error, ComponentRequest>({
    mutationFn: (data) => ComponentService.create(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: componentsKey(data.screenId) });
      toast({ title: "Componente adicionado" });
    },
    onError: (err) => {
      toast({ title: "Erro ao criar componente", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateComponent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    ComponentResponse,
    Error,
    { id: number; screenId: number; data: ComponentRequest }
  >({
    mutationFn: ({ id, data }) => ComponentService.update(id, data),
    onSuccess: (_, { screenId }) => {
      queryClient.invalidateQueries({ queryKey: componentsKey(screenId) });
      toast({ title: "Componente atualizado" });
    },
    onError: (err) => {
      toast({ title: "Erro ao atualizar componente", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteComponent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, { id: number; screenId: number }>({
    mutationFn: ({ id }) => ComponentService.delete(id),
    onSuccess: (_, { screenId }) => {
      queryClient.invalidateQueries({ queryKey: componentsKey(screenId) });
      toast({ title: "Componente removido" });
    },
    onError: (err) => {
      toast({ title: "Erro ao excluir componente", description: err.message, variant: "destructive" });
    },
  });
}
