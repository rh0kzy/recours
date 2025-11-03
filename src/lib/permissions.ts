// Admin Role Definitions and Permission Utilities
// ================================================

export type AdminRole = 'viewer' | 'reviewer' | 'super_admin' | 'department_admin';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Permission {
  action: string;
  resource: string;
}

// ================================================
// PERMISSION DEFINITIONS
// ================================================

export const PERMISSIONS = {
  // Request permissions
  VIEW_REQUESTS: 'view:requests',
  APPROVE_REQUESTS: 'approve:requests',
  REJECT_REQUESTS: 'reject:requests',
  DELETE_REQUESTS: 'delete:requests',
  EDIT_REQUESTS: 'edit:requests',
  ASSIGN_REQUESTS: 'assign:requests',
  
  // User management permissions
  VIEW_USERS: 'view:users',
  CREATE_USERS: 'create:users',
  EDIT_USERS: 'edit:users',
  DELETE_USERS: 'delete:users',
  MANAGE_ROLES: 'manage:roles',
  
  // Data permissions
  EXPORT_DATA: 'export:data',
  VIEW_STATISTICS: 'view:statistics',
  
  // System permissions
  VIEW_AUDIT_LOGS: 'view:audit_logs',
  MANAGE_SETTINGS: 'manage:settings',
  
  // Department permissions
  VIEW_ALL_DEPARTMENTS: 'view:all_departments',
  VIEW_OWN_DEPARTMENT: 'view:own_department',
} as const;

// ================================================
// ROLE PERMISSION MAPPING
// ================================================

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  viewer: [
    PERMISSIONS.VIEW_REQUESTS,
    PERMISSIONS.VIEW_STATISTICS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_ALL_DEPARTMENTS,
  ],
  
  reviewer: [
    PERMISSIONS.VIEW_REQUESTS,
    PERMISSIONS.APPROVE_REQUESTS,
    PERMISSIONS.REJECT_REQUESTS,
    PERMISSIONS.EDIT_REQUESTS,
    PERMISSIONS.VIEW_STATISTICS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_ALL_DEPARTMENTS,
  ],
  
  super_admin: [
    PERMISSIONS.VIEW_REQUESTS,
    PERMISSIONS.APPROVE_REQUESTS,
    PERMISSIONS.REJECT_REQUESTS,
    PERMISSIONS.DELETE_REQUESTS,
    PERMISSIONS.EDIT_REQUESTS,
    PERMISSIONS.ASSIGN_REQUESTS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_STATISTICS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_ALL_DEPARTMENTS,
  ],
  
  department_admin: [
    PERMISSIONS.VIEW_REQUESTS,
    PERMISSIONS.APPROVE_REQUESTS,
    PERMISSIONS.REJECT_REQUESTS,
    PERMISSIONS.EDIT_REQUESTS,
    PERMISSIONS.VIEW_STATISTICS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_OWN_DEPARTMENT, // Limited to own department
  ],
};

// ================================================
// PERMISSION CHECK UTILITIES
// ================================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: AdminRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if user can access a specific department
 */
export function canAccessDepartment(
  user: AdminUser,
  targetDepartment: string
): boolean {
  // Super admin and users with VIEW_ALL_DEPARTMENTS can access any department
  if (hasPermission(user.role, PERMISSIONS.VIEW_ALL_DEPARTMENTS)) {
    return true;
  }
  
  // Department admin can only access their own department
  if (user.role === 'department_admin') {
    return user.department === targetDepartment;
  }
  
  return false;
}

/**
 * Check multiple permissions at once
 */
export function hasAnyPermission(role: AdminRole, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if user has all specified permissions
 */
export function hasAllPermissions(role: AdminRole, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: AdminRole): string[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Check if role is at least as powerful as another role
 */
export function isRoleAtLeast(userRole: AdminRole, requiredRole: AdminRole): boolean {
  const hierarchy: Record<AdminRole, number> = {
    viewer: 1,
    department_admin: 2,
    reviewer: 3,
    super_admin: 4,
  };
  
  return hierarchy[userRole] >= hierarchy[requiredRole];
}

// ================================================
// ROLE METADATA
// ================================================

export const ROLE_METADATA: Record<AdminRole, {
  label: string;
  description: string;
  color: string;
  icon: string;
}> = {
  viewer: {
    label: 'Viewer',
    description: 'Can view all data but cannot make changes',
    color: 'blue',
    icon: '👁️',
  },
  reviewer: {
    label: 'Reviewer',
    description: 'Can review and approve/reject requests',
    color: 'green',
    icon: '✅',
  },
  super_admin: {
    label: 'Super Admin',
    description: 'Full system access including user management',
    color: 'red',
    icon: '👑',
  },
  department_admin: {
    label: 'Department Admin',
    description: 'Can manage requests for their specific department',
    color: 'purple',
    icon: '🏢',
  },
};

// ================================================
// AUDIT LOG ACTION TYPES
// ================================================

export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout',
  LOGIN_FAILED: 'auth:login_failed',
  SESSION_EXPIRED: 'auth:session_expired',
  
  // Request actions
  REQUEST_VIEWED: 'request:viewed',
  REQUEST_APPROVED: 'request:approved',
  REQUEST_REJECTED: 'request:rejected',
  REQUEST_DELETED: 'request:deleted',
  REQUEST_UPDATED: 'request:updated',
  REQUEST_ASSIGNED: 'request:assigned',
  
  // User management
  USER_CREATED: 'user:created',
  USER_UPDATED: 'user:updated',
  USER_DELETED: 'user:deleted',
  USER_DEACTIVATED: 'user:deactivated',
  USER_ACTIVATED: 'user:activated',
  
  // Data operations
  DATA_EXPORTED: 'data:exported',
  
  // Settings
  SETTINGS_UPDATED: 'settings:updated',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

// ================================================
// HELPER TYPES
// ================================================

export interface AuditLog {
  id: string;
  adminUserId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AdminSession {
  id: string;
  adminUserId: string;
  token: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ================================================
// VALIDATION UTILITIES
// ================================================

/**
 * Validate if a string is a valid role
 */
export function isValidRole(role: string): role is AdminRole {
  return ['viewer', 'reviewer', 'super_admin', 'department_admin'].includes(role);
}

/**
 * Get user-friendly role name
 */
export function getRoleLabel(role: AdminRole): string {
  return ROLE_METADATA[role].label;
}

/**
 * Get role description
 */
export function getRoleDescription(role: AdminRole): string {
  return ROLE_METADATA[role].description;
}

/**
 * Get role color for UI
 */
export function getRoleColor(role: AdminRole): string {
  return ROLE_METADATA[role].color;
}

/**
 * Get role icon
 */
export function getRoleIcon(role: AdminRole): string {
  return ROLE_METADATA[role].icon;
}

// ================================================
// EXPORT ALL
// ================================================

export default {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_METADATA,
  AUDIT_ACTIONS,
  hasPermission,
  canAccessDepartment,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  isRoleAtLeast,
  isValidRole,
  getRoleLabel,
  getRoleDescription,
  getRoleColor,
  getRoleIcon,
};
