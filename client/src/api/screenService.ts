/**
 * Screen API Service
 *
 * GET    /api/screens
 * GET    /api/screens/:id
 * POST   /api/screens
 * PUT    /api/screens/:id
 * DELETE /api/screens/:id
 */

import api from "./api-client";
import { api as apiRoutes, buildUrl } from "@shared/routes";
import type { ScreenRequest, ScreenResponse } from "../types/api";

export const ScreenService = {
  async getAll(appId?: string): Promise<ScreenResponse[]> {
    const res = await api.get<ScreenResponse[]>(apiRoutes.screens.list.path, {
      params: appId ? { appId } : undefined,
    });
    return appId
      ? res.data.filter((screen) => screen.appEntityId === appId || screen.appId === appId)
      : res.data;
  },

  async getById(id: string): Promise<ScreenResponse> {
    const res = await api.get<ScreenResponse>(apiRoutes.screens.get.path.replace(':id', id));
    return res.data;
  },

  async create(payload: ScreenRequest): Promise<ScreenResponse> {
    const res = await api.post<ScreenResponse>(apiRoutes.screens.create.path, {
      ...payload,
    });
    return res.data;
  },

  async update(id: string, payload: ScreenRequest): Promise<void> {
    const { appId: _appId, ...data } = payload;
    await api.put(apiRoutes.screens.update.path.replace(':id', id), data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(apiRoutes.screens.delete.path.replace(':id', id));
  },
};
