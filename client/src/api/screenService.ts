/**
 * Screen API Service
 * Handles CRUD operations for Screen resource
 * TODO: Verify controller routes in flexa.Api\Controllers\ScreenController.cs
 * TODO: Confirm whether controllers pass userId or extract from JWT
 */

import api from './api';
import type { ScreenRequest, ScreenResponse } from '../types/api';

const RESOURCE = '/api/screens'; // TODO: Verify exact endpoint name

export const ScreenService = {
  /**
   * Get all screens for an AppEntity
   * TODO: Verify whether filter by appId query param is supported
   * Endpoint might be: GET /api/screens?appEntityId=123
   */
  async getAllForApp(appEntityId: number): Promise<ScreenResponse[]> {
    const response = await api.get<ScreenResponse[]>(RESOURCE, {
      params: { appEntityId },
    });
    return response.data;
  },

  /**
   * Get a single Screen by ID
   * TODO: Verify in ScreenController.cs: GET api/screens/{id}
   */
  async getById(id: number): Promise<ScreenResponse> {
    const response = await api.get<ScreenResponse>(`${RESOURCE}/${id}`);
    return response.data;
  },

  /**
   * Create a new Screen
   * TODO: Verify POST body structure in ScreenController.cs
   */
  async create(payload: ScreenRequest): Promise<ScreenResponse> {
    const response = await api.post<ScreenResponse>(RESOURCE, payload);
    return response.data;
  },

  /**
   * Update an existing Screen
   * TODO: Verify PUT body structure in ScreenController.cs
   */
  async update(id: number, payload: ScreenRequest): Promise<ScreenResponse> {
    const response = await api.put<ScreenResponse>(`${RESOURCE}/${id}`, payload);
    return response.data;
  },

  /**
   * Delete a Screen
   * TODO: Verify response type in ScreenController.cs
   */
  async delete(id: number): Promise<void> {
    await api.delete(`${RESOURCE}/${id}`);
  },
};
