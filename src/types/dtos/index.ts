import { DataItemStatus } from '@/enums';

/**
 * 用户DTO - 与后端 UserDTO 对应
 * 不包含敏感信息（password）
 */
export interface UserDTO {
    id?: number;
    username?: string;
    nickname?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
    employeeNo?: string;
    status?: DataItemStatus;
    lastLoginAt?: string;
    departmentId?: number;
    departmentName?: string;
    roleIds?: number[];
    roles?: RoleDTO[];
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 角色DTO - 与后端 RoleDTO 对应
 */
export interface RoleDTO {
    id?: number;
    name?: string;
    code?: string;
    remark?: string;
    permissionCount?: number;
    memberCount?: number;
    permissionIds?: number[];
    permissions?: PermissionDTO[];
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 权限DTO - 与后端 PermissionDTO 对应
 */
export interface PermissionDTO {
    id?: number;
    name?: string;
    code?: string;
    description?: string;
    superPermission?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
