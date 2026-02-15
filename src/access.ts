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
