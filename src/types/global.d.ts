/**
 * 全局 API 类型定义
 * 
 * 此文件不包含任何 import/export 语句，以保持全局声明特性
 * 需要引用其他模块的类型时，使用 import("模块路径").类型名 语法
 */

/**
 * API 命名空间 - 包含通用的请求/响应类型
 */
declare namespace API {
    /** 通用响应结果 */
    type Result<T = unknown> = {
        code?: number;
        message?: string;
        error?: any;
        data: T;
        path?: string;
        status?: number;
        timestamp?: string;
        traceId?: string;
    };

    /** 分页结果 */
    type PageResult<T = unknown> = {
        content: T[];
        totalElement: number;
        totalPage: number;
        /** @deprecated 使用 totalElement */
        totalElements?: number;
        /** @deprecated 使用 totalPage */
        totalPages?: number;
        size?: number;
        number?: number;
    };

    /** 分页请求参数 */
    type PageParams = {
        page?: number;
        size?: number;
        pageNumber?: number;
        pageSize?: number;
        sort?: string;
        keyword?: string;
        [key: string]: any;
    };
}

// ============================================================================
// 认证相关类型
// ============================================================================

declare type LoginParams = {
    username: string;
    password: string;
    captcha: string;
    uuid: string;
}

declare type LoginResponse = {
    token: string;
    username: string;
}

declare type CaptchaResponse = {
    uuid: string;
    img: string;
}

declare type CurrentUser = {
    id?: string;
    name?: string;
    nickname?: string;
    avatar?: string;
    roles?: string[];
    permissions?: string[];
    token?: string;
}

// ============================================================================
// 系统管理 DTO
// ============================================================================

/**
 * 用户DTO - 与后端 UserDTO 对应
 */
declare type UserDTO = {
    id?: number;
    username?: string;
    nickname?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
    employeeNo?: string;
    status?: import("@/enums").DataItemStatus;
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
 * 部门
 */
declare type SysDepartment = {
    id?: number;
    name: string;
    managerId?: number;
    managerName?: string;
    parentId?: number;
    parentName?: string;
    memberCount?: number;
    status?: import("@/enums").DataItemStatus;
    children?: SysDepartment[];
    description?: string;
}

/**
 * 岗位
 */
declare type SysPost = {
    id?: number;
    code: string;
    name: string;
    ranking?: number;
    status?: import("@/enums").DataItemStatus;
}

// ============================================================================
// 通用类型
// ============================================================================

declare type Option = {
    value: any;
    label: string;
    key?: any;
    index?: any;
}

declare interface TreeNode {
    id: string | number;
    label: string;
    children?: TreeNode[];
}

declare type TableAction = 'add' | 'edit' | 'delete' | 'view' | 'export' | 'import';

declare type CommonStatus = 'ENABLED' | 'DISABLED';

// ============================================================================
// 基础实体类型
// ============================================================================

declare interface Entity {
    id?: number | string;
}

declare interface BaseEntity extends Entity {
    sort?: number;
    updatedAt?: Date | string;
    createdAt?: Date | string;
}
