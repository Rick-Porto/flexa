/**
 * Component API Service
 * Handles CRUD operations for Component resource
 * TODO: Verify controller routes in flexa.Api\Controllers\ComponentController.cs
 */

import api from './api';
import type { ComponentRequest, ComponentResponse } from '../types/api';

const RESOURCE = '/api/components'; // TODO: Verify exact endpoint name

export const ComponentService = {
  /**
   * Get all components for a Screen
   * TODO: Verify endpoint for getting components by screenId
   * Might be: GET /api/components?screenId=123 OR GET /api/screens/{screenId}/components
   */
  async getAllForScreen(screenId: number): Promise<ComponentResponse[]> {
    const response = await api.get<ComponentResponse[]>(RESOURCE, {
      params: { screenId },
    });
    return response.data;
  },

  /**
   * Get a single Component by ID
   * TODO: Verify in ComponentController.cs: GET api/components/{id}
   */
  async getById(id: number): Promise<ComponentResponse> {
    const response = await api.get<ComponentResponse>(`${RESOURCE}/${id}`);
    return response.data;
  },

  /**
   * Create a new Component
   * TODO: Verify POST body structure in ComponentController.cs
   * Verify: does config come as JSON string or object?
   */
  async create(payload: ComponentRequest): Promise<ComponentResponse> {
    const response = await api.post<ComponentResponse>(RESOURCE, payload);
    return response.data;
  },

  /**
   * Update an existing Component
   * TODO: Verify PUT body structure in ComponentController.cs
   */
  async update(id: number, payload: ComponentRequest): Promise<ComponentResponse> {
    const response = await api.put<ComponentResponse>(`${RESOURCE}/${id}`, payload);
    return response.data;
  },

  /**
   * Delete a Component
   * TODO: Verify response type in ComponentController.cs
   */
  async delete(id: number): Promise<void> {
    await api.delete(`${RESOURCE}/${id}`);
  },
};
