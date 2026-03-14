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
