import { DataItemStatus } from "@/enums";

declare type LoginParams = {
  username?: string;
  password?: string;
  captcha?: string;
  uuid?: string;
}

declare type SysUser = {
  userId?: string | number;
  username?: string;
  password: string;

  nickname: string;
  gender: number;
  phone?: string;
  email?: string;
  avatar: string;
  status: number;
  departmentId?: number;
  // roles?: Role[];
  permissions?: Permission[];
};

declare type Role = {
  roleId?: string | number;
  roleName?: string;
  roleKey: string;
  status: string;
}

/**
 * 用户DTO - 与后端 UserDTO 对应
 * 不包含敏感信息（password）
 */
declare type UserDTO = {
  id?: number;
  username?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  gender?: string; // 'MALE' | 'FEMALE' | 'UNKNOWN'
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
declare type RoleDTO = {
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
declare type PermissionDTO = {
  id?: number;
  name?: string;
  code?: string;
  description?: string;
  superPermission?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 当前用户 - 前端内部使用
 * 从 UserDTO 转换而来
 */
declare type CurrentUser = {
  id?: string;
  name?: string;
  nickname?: string;
  avatar?: string;
  roles?: string[];
  permissions?: string[];
  token?: string;
}

/**
 * @deprecated 使用 UserDTO 代替
 */
declare type BackendUser = {
  userId: string;
  username: string;
  nickname: string;
  avatar: string;
  roles: string[];
  authorities: string[]
}

declare type SysDepartment = {
  id?: number;
  name: string;
  managerId: number;
  managerName?: string;
  parentId?: number;
  parentName?: string;
  memberCount: number;
  status: DataItemStatus;
  children?: Array<SysDepartment>;
  description: string;
}

declare type SysPost = {
  id?: number;
  code: string;
  name: string;
  ranking: number;
  status: DataItemStatus;
}

declare type Result<T = unknown> = {
  code?: number;
  message?: string;
  error?: any;
  data: T;
  path?: string;
  status?: number;
  timestamp?: string;
  traceId?: string;
}

declare interface AntdResult {
  data: any;
  success: boolean;
  total: number;
}

declare interface Tree {
  id: string | number;
  label: string;
  children: Array<Tree>;
}

declare type Page<T = unknown> = {
  content: T[];
  totalElement: number;
  totalPage: number;
}

declare type Option = {
  value: any;
  label: string;
  key?: any;
  index?: any;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare interface Entity { }

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare interface AbstractEntity extends Entity { }

declare interface BaseEntity extends AbstractEntity {
  sort: number;
  updatedAt: Date;
  createdAt: Date;
}
