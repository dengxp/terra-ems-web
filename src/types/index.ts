// DTOs - 与后端对应的数据传输对象
export type { UserDTO, RoleDTO, PermissionDTO } from './dtos';

// API - API 相关类型
export type { ApiResponse, PageData, PageParams, RequestOptions } from './api';

// Auth - 认证相关类型
export type { LoginParams, LoginResponse, CurrentUser, CaptchaResponse } from './auth';

// Common - 通用类型
export type { Option, TreeNode, TableAction, CommonStatus } from './common';

// 保持向后兼容，导出一些常用类型
export type Result<T = unknown> = ApiResponse<T>;
export type Page<T = unknown> = PageData<T>;
