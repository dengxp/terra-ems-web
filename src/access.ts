/*
 * Copyright (c) 2025-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2025-2026 泰若科技（广州）有限公司.
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

import { PERMISSIONS } from "@/config/permissions";
import { Permissions } from "@/enums";

/**
 * @see https://umijs.org/docs/max/access#access
 * */
// export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
//   const { currentUser } = initialState ?? {};
//   return {
//     canAdmin: currentUser && currentUser.access === 'admin',
//   };
// }

export default function access(initialState: { currentUser?: CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};

  const hasPermission = (permissionNeed: string | Array<string>): boolean => {
    const permissions = currentUser?.permissions;
    if (!permissions || permissions.length === 0) return false;
    if (permissions.includes(PERMISSIONS.SUPER_ADMIN)) return true;

    if (typeof (permissionNeed) === 'string') {
      return permissions.includes(permissionNeed);
    } else if (typeof (permissionNeed) === 'object') {
      return permissionNeed.some(permission => permissions.includes(permission));
    } else {
      return false;
    }
  }

  const canAccess = (route: any): boolean => {
    const permissionNeed = route?.permissions;
    if (!permissionNeed || permissionNeed.length === 0) return true;
    return hasPermission(permissionNeed);
  }
  return {
    hasPermission,
    hasSuperAdmin: hasPermission(Permissions.superAdmin),
    canAccess
  };
}
