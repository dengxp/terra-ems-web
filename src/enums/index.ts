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
  permissionCreate = 'security:permission:create',
  permissionEdit = 'security:permission:edit',
  permissionDelete = 'security:permission:delete',
  superAdmin = 'super:super-admin'
}

export enum DictKeyEnum {
  GENDER = 'gender',
  CAMPUS_TYPE = "campusType",
}

export enum DataItemStatus {
  ENABLE,
  FORBIDDEN,
  LOCKING,
  EXPIRED
}

export enum EnergyCategory {
  ELECTRIC = 'ELECTRIC',
  GAS = 'GAS',
  STEAM = 'STEAM',
  WATER = 'WATER',
  OTHER = 'OTHER',
}

export const EnergyCategoryLabel: Record<EnergyCategory, string> = {
  [EnergyCategory.ELECTRIC]: '电力',
  [EnergyCategory.GAS]: '燃气',
  [EnergyCategory.STEAM]: '蒸汽',
  [EnergyCategory.WATER]: '水',
  [EnergyCategory.OTHER]: '其他',
};
