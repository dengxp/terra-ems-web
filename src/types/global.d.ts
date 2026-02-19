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
        success?: boolean;
    };

    /** 分页结果 */
    type PageResult<T = unknown> = {
        content: T[];
        totalElements: number;
        totalPages: number;
        size?: number;
        number?: number;
    };

    /** 分页请求参数 - 与后端保持一致 */
    type PageParams = {
        pageNumber?: number;
        pageSize?: number;
        sort?: string;
        keyword?: string;
        [key: string]: any;
    };

    /** 通用选项 */
    type Option = {
        label: string;
        value: string | number;
        disabled?: boolean;
        [key: string]: any;
    };

    /** 规则列表项 */
    type RuleListItem = {
        key?: number;
        disabled?: boolean;
        href?: string;
        avatar?: string;
        name?: string;
        owner?: string;
        desc?: string;
        callNo?: number;
        status?: number;
        updatedAt?: string;
        createdAt?: string;
        progress?: number;
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
    graphicImageBase64: string;
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
// 系统管理实体
// ============================================================================

/**
 * 系统用户 - 与后端 SysUser 对应
 */
declare type SysUser = {
    id?: number;
    username?: string;
    realName?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
    employeeNo?: string;
    status?: import("@/enums").DataItemStatus;
    lastLoginAt?: string;
    deptId?: number;
    departmentName?: string;
    dept?: SysDept;
    roles?: number[];       // 用于前端表单提交和接收的 ID 数组
    posts?: number[];   // 用于前端表单提交和接收的 ID 数组
    roleList?: SysRole[];   // 原始对象列表 (配合后端 @JsonIgnore，前端通常用不到)
    postList?: SysPost[];   // 原始对象列表 (配合后端 @JsonIgnore，前端通常用不到)
    permissions?: string[];
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 系统角色 - 与后端 SysRole 对应
 */
declare type SysRole = {
    id?: number;
    name?: string;
    code?: string;
    remark?: string;
    permissionCount?: number;
    memberCount?: number;
    permissionIds?: number[];
    permissions?: SysPermission[];
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 系统权限 - 与后端 SysPermission 对应
 */
declare type SysPermission = {
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
declare type SysDept = {
    id?: number;
    name: string;
    managerId?: number;
    managerName?: string;
    parentId?: number;
    parentName?: string;
    memberCount?: number;
    status?: import("@/enums").DataItemStatus;
    children?: SysDept[];
    description?: string;
}

/**
 * 岗位
 */
declare type SysPost = {
    id?: number;
    code: string;
    name: string;
    sortOrder?: number;
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
