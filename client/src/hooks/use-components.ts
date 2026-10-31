/**
 * Component Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ComponentService } from "@/api/componentService";
import type { ComponentRequest, ComponentResponse } from "@/types/api";

const componentsKey = (screenId: string, appId?: string) =>
  ["components", appId ?? "", screenId] as const;

export function useComponents(screenId: string | undefined, appId?: string) {
  const queryKey = componentsKey(String(screenId ?? ""), appId);

  return useQuery<ComponentResponse[]>({
    queryKey,
    queryFn: async () => {
      const components = await ComponentService.getByScreen(screenId!);
      return components.filter((component) => String(component.screenId) === String(screenId));
    },
    select: (components) =>
      components.filter((component) => String(component.screenId) === String(screenId)),
    enabled: screenId !== undefined,
  });
}

export function useCreateComponent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    ComponentResponse,
    Error,
    { appId?: string; data: ComponentRequest },
    { optimisticId: string; queryKey: ReturnType<typeof componentsKey> }
  >({
    mutationFn: ({ data }) => ComponentService.create(data),
    onMutate: async ({ appId, data }) => {
      const queryKey = componentsKey(String(data.screenId), appId);
      const optimisticId = `optimistic-${Date.now()}`;
      const timestamp = new Date().toISOString();

      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<ComponentResponse[]>(queryKey, (current = []) => [
        ...current,
        {
          id: optimisticId,
          elementType: data.elementType,
          label: data.label,
          model: data.model ?? null,
          config: data.config ?? null,
          order: data.order ?? current.length,
          required: data.required ?? false,
          validationRule: data.validationRule ?? null,
          screenId: data.screenId,
          createdAt: timestamp,
          updatedAt: timestamp,
          dataEntries: [],
        },
      ]);

      return { optimisticId, queryKey };
    },
    onSuccess: async (created, _data, context) => {
      await queryClient.cancelQueries({ queryKey: context.queryKey });
      queryClient.setQueryData<ComponentResponse[]>(context.queryKey, (current = []) => {
        const withoutPlaceholder = current.filter(
          (component) => String(component.id) !== context.optimisticId
        );
        const existingIndex = withoutPlaceholder.findIndex(
          (component) => String(component.id) === String(created.id)
        );

        if (existingIndex >= 0) {
          return withoutPlaceholder.map((component, index) =>
            index === existingIndex ? created : component
          );
        }

        return [...withoutPlaceholder, created];
      });
      toast({ title: "Componente adicionado" });
    },
    onError: (err, _data, context) => {
      if (context) {
        queryClient.setQueryData<ComponentResponse[]>(context.queryKey, (current = []) =>
          current.filter((component) => component.id !== context.optimisticId)
        );
      }
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
    { id: string; screenId: string; appId?: string; data: ComponentRequest }
  >({
    mutationFn: ({ id, data }) => ComponentService.update(id, data),
    onSuccess: (updated, { id, screenId, appId }) => {
      queryClient.setQueryData<ComponentResponse[]>(componentsKey(String(screenId), appId), (current = []) =>
        current.map((component) => String(component.id) === String(id) ? updated : component)
      );
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

  return useMutation<
    void,
    Error,
    { id: string; screenId: string; appId?: string },
    { queryKey: ReturnType<typeof componentsKey>; previous: ComponentResponse[] }
  >({
    mutationFn: ({ id }) => ComponentService.delete(id),
    onMutate: async ({ id, screenId, appId }) => {
      const queryKey = componentsKey(String(screenId), appId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ComponentResponse[]>(queryKey) ?? [];
      queryClient.setQueryData<ComponentResponse[]>(queryKey, previous.filter(
        (component) => String(component.id) !== String(id)
      ));
      return { queryKey, previous };
    },
    onSuccess: async (_, { id, screenId, appId }) => {
      const queryKey = componentsKey(String(screenId), appId);
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<ComponentResponse[]>(queryKey, (current = []) =>
        current.filter((component) => String(component.id) !== String(id))
      );
      toast({ title: "Componente removido" });
    },
    onError: (err, _variables, context) => {
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
      toast({ title: "Erro ao excluir componente", description: err.message, variant: "destructive" });
    },
  });
}
