/**
 * API 统一导出
 */

// ============ 用户相关 ============
// ============ 系统常量相关 ============
export { fetchAllMaps, fetchAllOptions, getConstantMaps, getConstantOptions, getDictData, getEnumOptions, type ConstantMapResponse, type ConstantResponse } from './constant';
export * from './data';
// ============ 部门相关 ============
export {
  addMembers, createDept, deleteDept, findDeptById,
  findDeptListAll, findDeptsByPage, findDeptTree,
  findDeptTreeByCondition,
  findMembers, getDeptOptions, getDeptTree, getDeptTreeSelect, moveDepartment, removeMember, removeMembers, updateDept, type SysDept
} from './dept';
// ============ 认证相关 ============
export { createCaptcha, getCaptcha, login, loginBySms, logout, refreshToken, sendSmsCode } from './login';
// ============ 其他API ============
export * from './menu';
// ============ 岗位相关 ============
export {
  changePostStatus, createPost, deletePost, exportPost, findAllPosts,
  findPostById, findPostOptions, findPostsByPage, getPostOptions, updatePost, type SysPost
} from './post';
// ============ 角色相关 ============
export {
  batchDeleteRoles, createRole, deleteRole, findRoleById, findRoles, findRolesByPage, getRole, getRoleOptions,
  getRolePermissions, updateRole, updateRolePermissions
} from './role';
export {
  batchDeleteUsers, changeUserStatus, createUser, deleteUser, exportTemplate,
  exportUser, fetchCurrentUser, findByPage, findByUsername, findOptionsForDepartmentManager, findUserById, findUsersWithoutDepartment, getAuthRole, importUser, resetUserPwd, updateAuthRole, updateUser
} from './user';






