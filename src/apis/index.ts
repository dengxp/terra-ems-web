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
 * API 统一导出
 */

// ============ 用户相关 ============
// ============ 系统常量相关 ============
export { fetchAllMaps, fetchAllOptions, getConstantMaps, getConstantOptions, getDictData, getEnumOptions, type ConstantMapResponse, type ConstantResponse } from './constant';
export * from './data';
// ============ 部门相关 ============
export {
  addMembers, findDeptById,
  findDeptTree,
  findMembers, getDeptOptions, getDeptTree, getDeptTreeSelect, moveDepartment, removeMember, removeMembers, type SysDept
} from './dept';
// ============ 认证相关 ============
export { createCaptcha, getCaptcha, login, loginBySms, logout, refreshToken, sendSmsCode } from './login';
// ============ 其他API ============
export * from './menu';
// ============ 岗位相关 ============
export {
  changePostStatus, exportPost,
  findPostById, getPostOptions, type SysPost
} from './post';
// ============ 角色相关 ============
export {
  findRoleById, getRole, getRoleOptions, findRoleList,
  getRolePermissions, updateRolePermissions
} from './role';
export * from './module';
export * from './permission';
export {
  changeUserStatus, downloadImportResult, exportTemplate,
  exportUser, fetchCurrentUser, findByUsername, findOptionsForDepartmentManager, findUserById, findUserPage, getAuthRole, importUser, resetUserPwd, setSuperAdmin, updateUserRoles
} from './user';






