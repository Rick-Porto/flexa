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
  metadata?: Record<string, any>;
}

export interface AppEntityResponse {
  id: string;              // Guid
  name: string | null;
  description: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  ownerId: string;         // Supabase user ID (from JWT sub)
  publicLink: string | null;  // Public link for published apps
  isPublished: boolean;    // Publication status
}

export interface AppEntityPublishResponse {
  id: string;
  name: string | null;
  description: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  publicLink: string;      // The generated public link
  isPublished: boolean;
}

export interface PublicAppResponse {
  id: string;
  name: string | null;
  description: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  publicLink: string;
  isPublished: boolean;
  screens: ScreenResponse[];
}

// ============================================================================
// Screen
// ============================================================================

export interface ScreenRequest {
  name?: string;
  description?: string;
  appId: string;           // Guid — required
  order?: number;
  metadata?: Record<string, any>;
}

export interface ScreenResponse {
  id: string;              // UUID
  name: string | null;
  description: string | null;
  appId?: string;
  appEntityId?: string;
  order: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  components: ComponentResponse[];
  dataEntries: DataEntryResponse[];
}

// ============================================================================
// Component
// ============================================================================

export interface ComponentRequest {
  elementType: string;     // required — "text", "select", "checkbox", etc.
  label: string;           // required
  model?: string;
  config?: Record<string, any>;
  order?: number;
  required?: boolean;
  validationRule?: string;
  screenId: string;        // UUID
}

export interface ComponentResponse {
  id: string;              // UUID
  elementType: string;
  label: string;
  model: string | null;
  config: Record<string, any>;
  order: number;
  required: boolean;
  validationRule: string | null;
  screenId: string;
  createdAt: string;
  updatedAt: string;
  dataEntries: DataEntryResponse[];
}

// ============================================================================
// DataEntry
// ============================================================================

export interface DataEntryRequest {
  config?: string | Record<string, any> | null;
  data?: string | Record<string, any>;
  screenId: number | string;
  componentId: number | string;
}

export interface DataEntryResponse {
  id: number | string;
  config: string | Record<string, any> | null;
  data: string | Record<string, any>;
  screenId: number | string;
  componentId: number | string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API Error
// ============================================================================

export interface ApiErrorResponse {
  error: string;           // backend uses "error", not "message"
}
