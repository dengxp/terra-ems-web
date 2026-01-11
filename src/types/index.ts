// DTOs - 与后端对应的数据传输对象
export type { UserDTO, RoleDTO, PermissionDTO } from './dtos';

// Auth - 认证相关类型
export type { LoginParams, LoginResponse, CurrentUser, CaptchaResponse } from './auth';

// Common - 通用类型
export type { Option, TreeNode, TableAction, CommonStatus } from './common';

// Entity 基础类型，用于 useCrud 泛型约束
export interface Entity {
    id?: number | string;
}

// Result 和 Page 类型
export type Result<T = unknown> = {
    code?: number;
    message?: string;
    error?: unknown;
    data: T;
    path?: string;
    status?: number;
    timestamp?: string;
    traceId?: string;
};

export type Page<T = unknown> = {
    content: T[];
    totalElement: number;
    totalPage: number;
};

// 系统类型定义（从 api.d.ts 同步）
export type SysUser = {
    id?: number | string;
    userId?: string | number;
    username?: string;
    password?: string;
    nickname?: string;
    gender?: number;
    phone?: string;
    email?: string;
    avatar?: string;
    status?: number;
    departmentId?: number;
};


export type SysDepartment = {
    id?: number;
    name: string;
    managerId?: number;
    managerName?: string;
    parentId?: number;
    parentName?: string;
    memberCount?: number;
    status?: number;
    children?: SysDepartment[];
    description?: string;
};

export type SysPost = {
    id?: number;
    code: string;
    name: string;
    ranking?: number;
    status?: number;
};
