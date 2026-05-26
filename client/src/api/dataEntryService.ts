/**
 * DataEntry API Service
 *
 * GET    /api/dataentry
 * GET    /api/dataentry/:id
 * GET    /api/dataentry/by-screen/:screenId
 * GET    /api/dataentry/by-component/:componentId
 * POST   /api/dataentry
 * PUT    /api/dataentry/:id
 * DELETE /api/dataentry/:id
 */

import api from "./api-client";
import type { DataEntryRequest, DataEntryResponse } from "../types/api";

const RESOURCE = "/api/dataentry";

export const DataEntryService = {
  async getAll(): Promise<DataEntryResponse[]> {
    const res = await api.get<DataEntryResponse[]>(RESOURCE);
    return res.data;
  },

  async getById(id: number): Promise<DataEntryResponse> {
    const res = await api.get<DataEntryResponse>(`${RESOURCE}/${id}`);
    return res.data;
  },

  async getByScreen(screenId: number): Promise<DataEntryResponse[]> {
    const res = await api.get<DataEntryResponse[]>(
      `${RESOURCE}/by-screen/${screenId}`
    );
    return res.data;
  },

  async getByComponent(componentId: number): Promise<DataEntryResponse[]> {
    const res = await api.get<DataEntryResponse[]>(
      `${RESOURCE}/by-component/${componentId}`
    );
    return res.data;
  },

  async create(payload: DataEntryRequest): Promise<DataEntryResponse> {
    const res = await api.post<DataEntryResponse>(RESOURCE, payload);
    return res.data;
  },

  async update(id: number, payload: DataEntryRequest): Promise<DataEntryResponse> {
    const res = await api.put<DataEntryResponse>(`${RESOURCE}/${id}`, payload);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${RESOURCE}/${id}`);
  },
};
