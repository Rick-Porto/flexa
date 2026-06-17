/**
 * AppEntity API Service
 *
 * GET    /api/appentity
 * GET    /api/appentity/:id
 * POST   /api/appentity
 * PUT    /api/appentity/:id
 * DELETE /api/appentity/:id
 * POST   /api/appentity/:id/publish
 * POST   /api/appentity/:id/unpublish
 * GET    /api/appentity/public/:publicLink
 */

import api from "./api-client";
import type { AppEntityRequest, AppEntityResponse, AppEntityPublishResponse, PublicAppResponse } from "../types/api";

const RESOURCE = "/api/appentity";

export const AppEntityService = {
  async getAll(): Promise<AppEntityResponse[]> {
    const res = await api.get<AppEntityResponse[]>(RESOURCE);
    return res.data;
  },

  async getById(id: string): Promise<AppEntityResponse> {
    const res = await api.get<AppEntityResponse>(`${RESOURCE}/${id}`);
    return res.data;
  },

  async create(payload: AppEntityRequest): Promise<AppEntityResponse> {
    const res = await api.post<AppEntityResponse>(RESOURCE, payload);
    return res.data;
  },

  async update(id: string, payload: AppEntityRequest): Promise<void> {
    await api.put(`${RESOURCE}/${id}`, payload);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`${RESOURCE}/${id}`);
  },

  async publish(id: string): Promise<AppEntityPublishResponse> {
    const res = await api.post<AppEntityPublishResponse>(`${RESOURCE}/${id}/publish`);
    return res.data;
  },

  async unpublish(id: string): Promise<AppEntityResponse> {
    const res = await api.post<AppEntityResponse>(`${RESOURCE}/${id}/unpublish`);
    return res.data;
  },

  async getPublic(publicLink: string): Promise<PublicAppResponse> {
    const res = await api.get<PublicAppResponse>(`${RESOURCE}/public/${publicLink}`);
    return res.data;
  },
};
