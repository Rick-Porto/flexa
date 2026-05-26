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
import type { ScreenRequest, ScreenResponse } from "../types/api";

const RESOURCE = "/api/screens";

export const ScreenService = {
  async getAll(): Promise<ScreenResponse[]> {
    const res = await api.get<ScreenResponse[]>(RESOURCE);
    return res.data;
  },

  async getById(id: number): Promise<ScreenResponse> {
    const res = await api.get<ScreenResponse>(`${RESOURCE}/${id}`);
    return res.data;
  },

  async create(payload: ScreenRequest): Promise<ScreenResponse> {
    const res = await api.post<ScreenResponse>(RESOURCE, payload);
    return res.data;
  },

  async update(id: number, payload: ScreenRequest): Promise<void> {
    await api.put(`${RESOURCE}/${id}`, payload);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${RESOURCE}/${id}`);
  },
};
