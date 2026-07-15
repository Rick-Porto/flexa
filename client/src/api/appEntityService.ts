/**
 * AppEntity API Service
 *
 * GET    /api/apps
 * GET    /api/apps/:id
 * POST   /api/apps
 * PUT    /api/apps/:id
 * DELETE /api/apps/:id
 * POST   /api/apps/:id/publish
 * POST   /api/apps/:id/unpublish
 * GET    /api/apps/public/:publicLink
 */

import api from "./api-client";
import { api as apiRoutes } from "@shared/routes";
import type { AppEntityRequest, AppEntityResponse, AppEntityPublishResponse, PublicAppResponse } from "../types/api";

export const AppEntityService = {
  async getAll(): Promise<AppEntityResponse[]> {
    const res = await api.get<AppEntityResponse[]>(apiRoutes.apps.list.path);
    return (res.data ?? []).map((app) => ({
      ...app,
      isPublished: Boolean(app.isPublished || app.publicLink),
    }));
  },

  async getById(id: string): Promise<AppEntityResponse> {
    const res = await api.get<AppEntityResponse>(apiRoutes.apps.get.path.replace(':id', id));
    return res.data;
  },

  async create(payload: AppEntityRequest): Promise<AppEntityResponse> {
    const res = await api.post<AppEntityResponse>(apiRoutes.apps.create.path, payload);
    return res.data;
  },

  async update(id: string, payload: AppEntityRequest): Promise<void> {
    await api.put(apiRoutes.apps.update.path.replace(':id', id), payload);
  },

  async delete(id: string): Promise<void> {
    await api.delete(apiRoutes.apps.delete.path.replace(':id', id));
  },

  async publish(id: string): Promise<AppEntityPublishResponse> {
    const res = await api.post<AppEntityPublishResponse>(apiRoutes.apps.publish.path.replace(':id', id));
    return res.data;
  },

  async unpublish(id: string): Promise<AppEntityResponse> {
    const res = await api.post<AppEntityResponse>(apiRoutes.apps.unpublish.path.replace(':id', id));
    return res.data;
  },

  async getPublished(): Promise<AppEntityResponse[]> {
    const res = await api.get<AppEntityResponse[]>(apiRoutes.apps.published.path);
    return (res.data ?? [])
      .filter((app) => app.isPublished || Boolean(app.publicLink))
      .map((app) => ({
        ...app,
        isPublished: Boolean(app.isPublished || app.publicLink),
      }));
  },

  async getPublic(publicLink: string): Promise<PublicAppResponse> {
    const res = await api.get<PublicAppResponse>(apiRoutes.apps.public.path.replace(':publicLink', publicLink));
    return res.data;
  },
};
