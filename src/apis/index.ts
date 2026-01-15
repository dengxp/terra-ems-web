/**
 * API 统一导出
 */

// ============ 用户相关 ============
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
    createUser,
    updateUser,
    deleteUser,
    batchDeleteUsers,
    findByUsername,
} from './user';

// ============ 认证相关 ============
export { login, logout, getCaptcha, createCaptcha, sendSmsCode, loginBySms, refreshToken } from './login';

// ============ 角色相关 ============
export {
    findRolesByPage,
    findRoles,
    findRoleById,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    batchDeleteRoles,
    getRoleOptions,
    getRolePermissions,
    updateRolePermissions,
} from './role';

// ============ 部门相关 ============
export { type SysDept } from './dept';
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
    findDeptsByPage,
    createDept,
    updateDept,
    deleteDept,
    removeMember,
    getDeptTreeSelect,
} from './dept';

// ============ 岗位相关 ============
export { type SysPost } from './post';
export {
    getPostOptions,
    findPostOptions,
    exportPost,
    findPostsByPage,
    findAllPosts,
    findPostById,
    createPost,
    updatePost,
    deletePost,
    changePostStatus,
} from './post';

// ============ 系统常量相关 ============
export { type ConstantResponse, type ConstantMapResponse } from './constant';
export { getConstantOptions, getConstantMaps, getEnumOptions, getDictData, fetchAllOptions, fetchAllMaps } from './constant';

// ============ 其他API ============
export * from './menu';
export * from './data';
