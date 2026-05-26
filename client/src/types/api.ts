/**
 * TypeScript interfaces matching the .NET backend DTOs.
 *
 * ID types:
 *   AppEntity.id  → Guid (string UUID)
 *   Screen.id     → int
 *   Component.id  → int
 *   DataEntry.id  → int
 */

// ============================================================================
// AppEntity
// ============================================================================

export interface AppEntityRequest {
  name?: string;
  description?: string;
}

export interface AppEntityResponse {
  id: string;          // Guid
  name: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;      // Supabase user ID (from JWT sub)
}

// ============================================================================
// Screen
// ============================================================================

export interface ScreenRequest {
  name?: string;
  description?: string;
  appEntityId: string;  // Guid — required
}

export interface ScreenResponse {
  id: number;
  name: string | null;
  description: string | null;
  appEntityId: string;
  createdAt: string;
  updatedAt: string;
  components: ComponentResponse[];
  dataEntries: DataEntryResponse[];
}

// ============================================================================
// Component
// ============================================================================

export interface ComponentRequest {
  elementType: string;   // required — "text", "select", "checkbox", etc.
  label: string;         // required
  model?: string;
  config?: string;       // JSON string
  order?: number;
  required?: boolean;
  screenId: number;
}

export interface ComponentResponse {
  id: number;
  elementType: string;
  label: string;
  model: string | null;
  config: string | null;   // JSON string
  order: number;
  required: boolean;
  screenId: number;
  createdAt: string;
  updatedAt: string;
  dataEntries: DataEntryResponse[];
}

// ============================================================================
// DataEntry
// ============================================================================

export interface DataEntryRequest {
  config?: string;       // JSON string
  data?: string;         // JSON string, defaults to "{}"
  screenId: number;
  componentId: number;
}

export interface DataEntryResponse {
  id: number;
  config: string | null;
  data: string;          // JSON string — parse with JSON.parse()
  screenId: number;
  componentId: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API Error
// ============================================================================

export interface ApiErrorResponse {
  error: string;         // backend uses "error", not "message"
}
