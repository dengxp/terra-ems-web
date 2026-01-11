/**
 * 权限码常量定义
 * 使用层级化对象组织，方便代码补全并消除魔法字符串
 */
export const PERMISSIONS = {
    // 系统管理
    SYSTEM: {
        USER: {
            LIST: 'system:user:list',
            ADD: 'system:user:add',
            EDIT: 'system:user:edit',
            REMOVE: 'system:user:remove',
            EXPORT: 'system:user:export',
            RESET_PWD: 'system:user:resetPwd',
        },
        ROLE: {
            LIST: 'system:role:list',
            ADD: 'system:role:add',
            EDIT: 'system:role:edit',
            REMOVE: 'system:role:remove',
            EXPORT: 'system:role:export',
        },
        DEPT: {
            LIST: 'system:dept:list',
            ADD: 'system:dept:add',
            EDIT: 'system:dept:edit',
            REMOVE: 'system:dept:remove',
        },
        POST: {
            LIST: 'system:post:list',
            ADD: 'system:post:add',
            EDIT: 'system:post:edit',
            REMOVE: 'system:post:remove',
            EXPORT: 'system:post:export',
        },
        MENU: {
            LIST: 'system:menu:list',
            ADD: 'system:menu:add',
            EDIT: 'system:menu:edit',
            REMOVE: 'system:menu:remove',
        },
    },
    // 监控管理
    MONITOR: {
        ONLINE: 'monitor:online:list',
        JOB: 'monitor:job:list',
        LOGININFOR: 'monitor:logininfor:list',
    },
    // 超级管理员权限
    SUPER_ADMIN: '*:*:*',
};

export default PERMISSIONS;
