/*
 * Copyright (c) 2024-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2024-2026 泰若科技（广州）有限公司.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

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
    type Option<T = string | number> = {
        label: string;
        value: T;
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
    realName?: string;
    nickname?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    gender?: number;
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
    gender?: number;
    employeeNo?: string;
    status?: import("@/enums").DataItemStatus;
    lastLoginAt?: string;
    deptId?: number;
    departmentName?: string;
    dept?: SysDept;
    roleIds?: number[];       // 用于前端表单提交和接收的 ID 数组
    postIds?: number[];   // 用于前端表单提交和接收的 ID 数组
    roleList?: SysRole[];   // 原始对象列表 (配合后端 @JsonIgnore，前端通常用不到)
    postList?: SysPost[];   // 原始对象列表 (配合后端 @JsonIgnore，前端通常用不到)
    superAdmin?: boolean;
    roleCodes?: string[];
    permissions?: string[];
    permissionCodes?: string[];
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
    status?: import("@/enums").DataItemStatus;
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
    moduleId?: number;
    module?: SysModule;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 业务模块 - 与后端 SysModule 对应
 */
declare type SysModule = {
    id?: number;
    name?: string;
    code?: string;
    sortOrder?: number;
    permissions?: SysPermission[];
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
