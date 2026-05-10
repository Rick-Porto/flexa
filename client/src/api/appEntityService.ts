/**
 * AppEntity API Service
 * Handles CRUD operations for AppEntity resource
 * TODO: Verify controller routes in flexa.Api\Controllers\AppEntityController.cs
 * TODO: Confirm whether controllers require userId param or extract from JWT (check AppEntityController.cs)
 */

import api from './api';
import type { AppEntityRequest, AppEntityResponse } from '../types/api';

const RESOURCE = '/api/appentities'; // TODO: Verify exact endpoint name

export const AppEntityService = {
  /**
   * Get all AppEntities for the authenticated user
   * TODO: Verify whether endpoint returns all or filters by userId
   */
  async getAll(): Promise<AppEntityResponse[]> {
    const response = await api.get<AppEntityResponse[]>(RESOURCE);
    return response.data;
  },

  /**
   * Get a single AppEntity by ID
   * TODO: Verify in AppEntityController.cs: GET api/appentities/{id}
   */
  async getById(id: number): Promise<AppEntityResponse> {
    const response = await api.get<AppEntityResponse>(`${RESOURCE}/${id}`);
    return response.data;
  },

  /**
   * Create a new AppEntity
   * TODO: Verify POST body structure in AppEntityController.cs
   */
  async create(payload: AppEntityRequest): Promise<AppEntityResponse> {
    const response = await api.post<AppEntityResponse>(RESOURCE, payload);
    return response.data;
  },

  /**
   * Update an existing AppEntity
   * TODO: Verify PUT body structure in AppEntityController.cs
   */
  async update(id: number, payload: AppEntityRequest): Promise<AppEntityResponse> {
    const response = await api.put<AppEntityResponse>(`${RESOURCE}/${id}`, payload);
    return response.data;
  },

  /**
   * Delete an AppEntity
   * TODO: Verify response type (void or AppEntityResponse) in AppEntityController.cs
   */
  async delete(id: number): Promise<void> {
    await api.delete(`${RESOURCE}/${id}`);
  },
};
