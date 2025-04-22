declare type LoginParams = {
  username?: string;
  password?: string;
  code?: string;
  uuid?: string;
}

declare type User = {
  userId?: string | number;
  userName?: string;
  password: string;

  name: string;
  gender: number;
  phone?: string;
  email?: string;
  avatar: string;
  status: number;
  departmentId?: number;
  // roles?: Role[];
  permissions?: Permission[];
};

declare type CurrentUser = {
  id?: number;
  name?: string;
  avatar?: string;
  roles?: string[];
  permissions?: string[];
  token?: string;
}

declare type Result<T = unknown> = {
  code?: number;
  msg?: string;
  rows?: T[];
  success: boolean;
  total: number;
}

declare interface AntdResult {
  data: any;
  success: boolean;
  total: number;
}

declare interface Tree {
  id: string | number;
  label: string;
  children: Array<Tree>;
}

declare type Page<T = unknown> = {
  content: T[];
  totalElement: number;
  totalPage: number;
}

declare type Option = {
  value: any;
  label: string;
  key?: any;
  index?: any;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare interface Entity {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare interface AbstractEntity extends Entity {}

declare interface BaseEntity extends AbstractEntity {
  sort: number;
  updatedAt: Date;
  createdAt: Date;
}
