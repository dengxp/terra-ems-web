import { ReactComponent as BaseDataIcon } from '@/icons/svg/base-data.svg';
import { ReactComponent as CampusIcon } from '@/icons/svg/campus.svg';
import { ReactComponent as DepartmentIcon } from '@/icons/svg/department.svg';
import { ReactComponent as ModuleIcon } from "@/icons/svg/module.svg";
import { ReactComponent as PermissionsIcon } from "@/icons/svg/permissions.svg";
import { ReactComponent as RoleIcon } from "@/icons/svg/role.svg";
import { ReactComponent as TermIcon } from "@/icons/svg/term.svg";
import { ReactComponent as UsersOutlinedIcon } from "@/icons/svg/users-outlined.svg";

import { FunctionComponent } from "react";

interface IconMapInterface {
  [key: string]: FunctionComponent
}

const IconMap: IconMapInterface = {
  BaseData: BaseDataIcon,
  Campus: CampusIcon,
  Term: TermIcon,
  Department: DepartmentIcon,
  Role: RoleIcon,
  Module: ModuleIcon,
  Permissions: PermissionsIcon,
  UsersOutlined: UsersOutlinedIcon,
}

export {
  IconMap
};
