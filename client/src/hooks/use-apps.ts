/**
 * AppEntity Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AppEntityService } from "@/api/appEntityService";
import type { AppEntityRequest, AppEntityResponse, AppEntityPublishResponse, PublicAppResponse } from "@/types/api";

const APPS_KEY = ["apps"] as const;
const appKey = (id: string) => ["apps", id] as const;

export function useApps() {
  return useQuery<AppEntityResponse[]>({
    queryKey: APPS_KEY,
    queryFn: () => AppEntityService.getAll(),
  });
}

export function useApp(id: string | undefined) {
  return useQuery<AppEntityResponse>({
    queryKey: appKey(id ?? ""),
    queryFn: () => AppEntityService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateApp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<AppEntityResponse, Error, AppEntityRequest>({
    mutationFn: (data) => AppEntityService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPS_KEY });
      toast({ title: "App criado com sucesso" });
    },
    onError: (err) => {
      toast({ title: "Erro ao criar app", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateApp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, { id: string; data: AppEntityRequest }>({
    mutationFn: ({ id, data }) => AppEntityService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: APPS_KEY });
      queryClient.invalidateQueries({ queryKey: appKey(id) });
      toast({ title: "App atualizado" });
    },
    onError: (err) => {
      toast({ title: "Erro ao atualizar app", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteApp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: (id) => AppEntityService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPS_KEY });
      toast({ title: "App excluído" });
    },
    onError: (err) => {
      toast({ title: "Erro ao excluir app", description: err.message, variant: "destructive" });
    },
  });
}

export function usePublishApp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<AppEntityPublishResponse, Error, string>({
    mutationFn: (id) => AppEntityService.publish(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: APPS_KEY });
      queryClient.invalidateQueries({ queryKey: appKey(id) });
      toast({ title: "App publicado", description: `Link público: ${data.publicLink}` });
    },
    onError: (err) => {
      toast({ title: "Erro ao publicar app", description: err.message, variant: "destructive" });
    },
  });
}

export function useUnpublishApp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<AppEntityResponse, Error, string>({
    mutationFn: (id) => AppEntityService.unpublish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: APPS_KEY });
      queryClient.invalidateQueries({ queryKey: appKey(id) });
      toast({ title: "App despublicado" });
    },
    onError: (err) => {
      toast({ title: "Erro ao despublicar app", description: err.message, variant: "destructive" });
    },
  });
}

export function usePublishedApps() {
  return useQuery<AppEntityResponse[]>({
    queryKey: ["apps", "published"] as const,
    queryFn: () => AppEntityService.getAll(),
    select: (apps) => apps.filter(app => app.publicLink),
  });
}

export function usePublicApp(publicLink: string | undefined) {
  return useQuery<PublicAppResponse>({
    queryKey: ["apps", "public", publicLink] as const,
    queryFn: () => AppEntityService.getPublic(publicLink!),
    enabled: !!publicLink,
  });
}
