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
import type { ComponentRequest, ComponentResponse } from "../types/api";

const RESOURCE = "/api/component";

export const ComponentService = {
  async getAll(): Promise<ComponentResponse[]> {
    const res = await api.get<ComponentResponse[]>(RESOURCE);
    return res.data;
  },

  async getById(id: number): Promise<ComponentResponse> {
    const res = await api.get<ComponentResponse>(`${RESOURCE}/${id}`);
    return res.data;
  },

  async getByScreen(screenId: number): Promise<ComponentResponse[]> {
    const res = await api.get<ComponentResponse[]>(
      `${RESOURCE}/by-screen/${screenId}`
    );
    return res.data;
  },

  async create(payload: ComponentRequest): Promise<ComponentResponse> {
    const res = await api.post<ComponentResponse>(RESOURCE, payload);
    return res.data;
  },

  async update(id: number, payload: ComponentRequest): Promise<ComponentResponse> {
    const res = await api.put<ComponentResponse>(`${RESOURCE}/${id}`, payload);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${RESOURCE}/${id}`);
  },
};
