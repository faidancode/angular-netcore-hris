export interface PermissionDto {
  id: string;
  action: string;
  subject: string;
  conditions?: any;
  fields?: string[];
}

export interface RoleDto {
  id: string;
  name: string;
  description?: string;
  permissions: PermissionDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionIds: string[];
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
}
