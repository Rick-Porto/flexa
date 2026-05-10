/**
 * TypeScript interfaces matching .NET 9 backend DTOs
 * TODO: Verify exact field names and types in flexa.App\DTOs\*.cs
 */

// ============================================================================
// AppEntity DTO
// ============================================================================
// TODO: Verify in flexa.App\DTOs\AppEntity\AppEntityRequest.cs
export interface AppEntityRequest {
  name: string;
  description?: string | null;
}

// TODO: Verify in flexa.App\DTOs\AppEntity\AppEntityResponse.cs
export interface AppEntityResponse {
  id: number;
  name: string;
  description?: string | null;
  screens?: ScreenResponse[];
  createdAt: string; // ISO datetime
  updatedAt?: string | null;
}

// ============================================================================
// Screen DTO
// ============================================================================
// TODO: Verify in flexa.App\DTOs\Screen\ScreenRequest.cs
export interface ScreenRequest {
  name: string;
  description?: string | null;
  appEntityId: number;
}

// TODO: Verify in flexa.App\DTOs\Screen\ScreenResponse.cs
export interface ScreenResponse {
  id: number;
  name: string;
  description?: string | null;
  appEntityId: number;
  components?: ComponentResponse[];
  dataEntries?: DataEntryResponse[];
  createdAt: string; // ISO datetime
  updatedAt?: string | null;
}

// ============================================================================
// Component DTO
// ============================================================================
// TODO: Verify in flexa.App\DTOs\Component\ComponentRequest.cs
export interface ComponentRequest {
  elementType: string; // "text", "number", "date", "checkbox", "dropdown"
  label?: string | null;
  model?: string | null;
  config?: string | null; // JSON string or object
  order?: number | null;
  required?: boolean | null;
  screenId: number;
}

// TODO: Verify in flexa.App\DTOs\Component\ComponentResponse.cs
export interface ComponentResponse {
  id: number;
  elementType: string;
  label?: string | null;
  model?: string | null;
  config?: string | null;
  order?: number | null;
  required?: boolean | null;
  screenId: number;
  createdAt: string; // ISO datetime
  updatedAt?: string | null;
}

// ============================================================================
// DataEntry DTO
// ============================================================================
// TODO: Verify in flexa.App\DTOs\DataEntry\DataEntryRequest.cs
export interface DataEntryRequest {
  config?: string | null;
  data?: string | null;
  screenId?: number | null;
  componentId?: number | null;
}

// TODO: Verify in flexa.App\DTOs\DataEntry\DataEntryResponse.cs
export interface DataEntryResponse {
  id: number;
  config?: string | null;
  data?: string | null;
  screenId?: number | null;
  componentId?: number | null;
  createdAt: string; // ISO datetime
  updatedAt?: string | null;
}

// ============================================================================
// Auth & User
// ============================================================================
// TODO: Verify user response structure in flexa.Api\Controllers\AuthController.cs
export interface UserResponse {
  id: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

// TODO: Verify login response structure
export interface LoginResponse {
  token: string;
  user: UserResponse;
}

// ============================================================================
// API Error Response
// ============================================================================
export interface ApiErrorResponse {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}
