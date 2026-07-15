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
import { api as apiRoutes, buildUrl } from "@shared/routes";
import type { DataEntryRequest, DataEntryResponse } from "../types/api";

export const DataEntryService = {
  async getAll(_appId: string, screenId: string): Promise<DataEntryResponse[]> {
    const res = await api.get<DataEntryResponse[]>(
      buildUrl('/api/DataEntry/by-screen/:screenId', { screenId })
    );
    return res.data;
  },

  async getById(id: string): Promise<DataEntryResponse> {
    const res = await api.get<DataEntryResponse>(apiRoutes.dataEntries.get.path.replace(':id', id));
    return res.data;
  },

  async getByScreen(_appId: string, screenId: string): Promise<DataEntryResponse[]> {
    const res = await api.get<DataEntryResponse[]>(
      buildUrl('/api/DataEntry/by-screen/:screenId', { screenId })
    );
    return res.data;
  },

  async create(_appId: string, payload: DataEntryRequest): Promise<DataEntryResponse> {
    const res = await api.post<DataEntryResponse>(apiRoutes.dataEntries.create.path, payload);
    return res.data;
  },

  async update(id: string, payload: DataEntryRequest): Promise<DataEntryResponse> {
    const res = await api.put<DataEntryResponse>(apiRoutes.dataEntries.update.path.replace(':id', id), payload);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(apiRoutes.dataEntries.delete.path.replace(':id', id));
  },
};
