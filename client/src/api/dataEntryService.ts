/**
 * DataEntry API Service
 * Handles CRUD operations for DataEntry resource (form submissions)
 * TODO: Verify controller routes in flexa.Api\Controllers\DataEntryController.cs
 */

import api from './api';
import type { DataEntryRequest, DataEntryResponse } from '../types/api';

const RESOURCE = '/api/dataentries'; // TODO: Verify exact endpoint name

export const DataEntryService = {
  /**
   * Get all DataEntries for a Screen
   * TODO: Verify endpoint for filtering by screenId
   * Might be: GET /api/dataentries?screenId=123 OR GET /api/screens/{screenId}/dataentries
   */
  async getAllForScreen(screenId: number): Promise<DataEntryResponse[]> {
    const response = await api.get<DataEntryResponse[]>(RESOURCE, {
      params: { screenId },
    });
    return response.data;
  },

  /**
   * Get all DataEntries for a Component
   * TODO: Verify endpoint for filtering by componentId
   * Might be: GET /api/dataentries?componentId=123
   */
  async getAllForComponent(componentId: number): Promise<DataEntryResponse[]> {
    const response = await api.get<DataEntryResponse[]>(RESOURCE, {
      params: { componentId },
    });
    return response.data;
  },

  /**
   * Get a single DataEntry by ID
   * TODO: Verify in DataEntryController.cs: GET api/dataentries/{id}
   */
  async getById(id: number): Promise<DataEntryResponse> {
    const response = await api.get<DataEntryResponse>(`${RESOURCE}/${id}`);
    return response.data;
  },

  /**
   * Create a new DataEntry (form submission)
   * TODO: Verify POST body structure in DataEntryController.cs
   * Verify: does data come as JSON string or object?
   */
  async create(payload: DataEntryRequest): Promise<DataEntryResponse> {
    const response = await api.post<DataEntryResponse>(RESOURCE, payload);
    return response.data;
  },

  /**
   * Update an existing DataEntry
   * TODO: Verify PUT body structure in DataEntryController.cs
   */
  async update(id: number, payload: DataEntryRequest): Promise<DataEntryResponse> {
    const response = await api.put<DataEntryResponse>(`${RESOURCE}/${id}`, payload);
    return response.data;
  },

  /**
   * Delete a DataEntry
   * TODO: Verify response type in DataEntryController.cs
   */
  async delete(id: number): Promise<void> {
    await api.delete(`${RESOURCE}/${id}`);
  },
};
