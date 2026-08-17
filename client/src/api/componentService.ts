/**
 * Component API Service
 *
 * GET    /api/component
 * GET    /api/component/:id
 * GET    /api/component/by-screen/:screenId
 * POST   /api/component
 * PUT    /api/component/:id
 * DELETE /api/component/:id
 */

import api from "./api-client";
import { api as apiRoutes, buildUrl } from "@shared/routes";
import type { ComponentRequest, ComponentResponse } from "../types/api";

const normalizeComponentPayload = (payload: ComponentRequest) => ({
  ...payload,
  config:
    payload.config == null
      ? null
      : typeof payload.config === "string"
        ? payload.config
        : JSON.stringify(payload.config),
});

export const ComponentService = {
  async getAll(): Promise<ComponentResponse[]> {
    const res = await api.get<ComponentResponse[]>(apiRoutes.components.list.path);
    return res.data;
  },

  async getById(id: string): Promise<ComponentResponse> {
    const res = await api.get<ComponentResponse>(apiRoutes.components.get.path.replace(':id', id));
    return res.data;
  },

  async getByScreen(screenId: string): Promise<ComponentResponse[]> {
    const res = await api.get<ComponentResponse[]>(
      buildUrl('/api/Component/by-screen/:screenId', { screenId })
    );
    return res.data;
  },

  async create(payload: ComponentRequest): Promise<ComponentResponse> {
    const res = await api.post<ComponentResponse>(apiRoutes.components.create.path, normalizeComponentPayload(payload));
    return res.data;
  },

  async update(id: string, payload: ComponentRequest): Promise<ComponentResponse> {
    const res = await api.put<ComponentResponse>(apiRoutes.components.update.path.replace(':id', id), normalizeComponentPayload(payload));
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(apiRoutes.components.delete.path.replace(':id', id));
  },
};
