/**
 * API 统一导出
 * 提供类型安全的 API 调用入口
 */

// ============ API Client ============
export { ApiClient } from './client';

// ============ 用户相关 ============
export { UserApi } from './user';
export {
    findByPage,
    findUserById,
    fetchCurrentUser,
    changeUserStatus,
    resetUserPwd,
    getAuthRole,
    updateAuthRole,
    importUser,
    exportTemplate,
    exportUser,
    findOptionsForDepartmentManager,
    findUsersWithoutDepartment,
} from './user';

// ============ 认证相关 ============
export { AuthApi } from './login';
export { login, logout, getCaptcha } from './login';

// ============ 角色相关 ============
export { RoleApi } from './role';
export { findRoles, findRoleById, getRole } from './role';

// ============ 部门相关 ============
export { DepartmentApi, type DepartmentDTO } from './dept';
export {
    findDeptById,
    findDeptListAll,
    getDeptTree,
    getDeptOptions,
    findDeptTree,
    findDeptTreeByCondition,
    findMembers,
    addMembers,
    removeMembers,
    moveDepartment,
} from './dept';

// ============ 职位相关 ============
export { PositionApi, type PositionDTO } from './position';
export { getPositionOptions, findOptions, exportPosition } from './position';

// ============ 系统常量相关 ============
export { ConstantApi, type ConstantResponse, type ConstantMapResponse } from './constant';
export { getConstantOptions, getConstantMaps } from './constant';

// ============ 其他API (保持向后兼容) ============
// 这些 API 还未重构，保持原有导出
export * from './menu';
export * from './post';
export * from './data';
