// Type definitions for Agility SDK to fix TypeScript errors

// Match the exact SDK ListParams structure - all properties required
export interface ListParams {
  filter: string;
  fields: string;
  sortDirection: string;
  sortField: string;
  showDeleted: boolean;
  take: number;
  skip: number;
}

// Error interface for API responses
export interface ApiError {
  response?: {
    status: number;
    data?: any;
  };
  message: string;
}

// Helper function to check if error is an API error
export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

// Helper function to safely get environment variable
export function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required in environment variables`);
  }
  return value;
}

// Helper function to get optional environment variable with default
export function getOptionalEnvVar(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

// Helper function to create ListParams with proper defaults (all required)
export function createListParams(options: {
  take?: number;
  skip?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  filter?: string;
  fields?: string;
  showDeleted?: boolean;
}): ListParams {
  return {
    filter: options.filter || '',           // Required string, defaults to empty
    fields: options.fields || '',           // Required string, defaults to empty  
    sortDirection: options.direction || 'asc',  // Required string
    sortField: options.sort || 'contentID',     // Required string
    showDeleted: options.showDeleted || false,  // Required boolean
    take: options.take || 50,                   // Required number
    skip: options.skip || 0                     // Required number
  };
}

// Helper function for safe error handling
export function handleApiError(error: unknown, operation: string): never {
  console.error(`Error in ${operation}:`, error);
  
  if (isApiError(error)) {
    if (error.response?.status === 401) {
      throw new Error('Authentication failed - please check your AGILITY_ACCESS_TOKEN');
    }
    
    if (error.response?.status === 404) {
      throw new Error(`Resource not found during ${operation}`);
    }
    
    throw new Error(`Failed ${operation}: ${error.message}`);
  }
  
  throw new Error(`Failed ${operation}: ${String(error)}`);
}