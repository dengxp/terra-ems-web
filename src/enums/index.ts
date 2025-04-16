export * from './http';

export enum OperationEnum {
  CREATE = 'create',
  EDIT = 'edit',
  DETAIL = 'detail',
  AUTHORIZE = 'authorize',
  ALLOCATABLE = 'allocatable',
  REFRESH = "refresh",       // 添加REFRESH，表示页面需要刷新，用在修改或新增记录后，列表页需要刷新
  CONFIG = "config"
}

export enum Permissions {
    permissionCreate= 'security:permission:create',
    permissionEdit = 'security:permission:edit',
    permissionDelete = 'security:permission:delete',
    superAdmin = 'super:super-admin'
}

export enum DictKeyEnum {
  GENDER = 'gender',
  CAMPUS_TYPE = "campusType",
}
