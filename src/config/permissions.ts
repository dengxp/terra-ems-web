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

/**
 * 权限码常量定义
 * 使用层级化对象组织，方便代码补全并消除魔法字符串
 */
export const PERMISSIONS = {
    // ===================== 系统管理 =====================
    SYSTEM: {
        USER: {
            LIST: 'system:user:list',
            ADD: 'system:user:add',
            EDIT: 'system:user:edit',
            REMOVE: 'system:user:remove',
            EXPORT: 'system:user:export',
            IMPORT: 'system:user:import',
            RESET_PWD: 'system:user:resetPwd',
            ASSIGN_ROLE: 'system:user:assignRole',
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
        NOTICE: {
            LIST: 'system:notice:list',
            ADD: 'system:notice:add',
            EDIT: 'system:notice:edit',
            REMOVE: 'system:notice:remove',
        },
        CONFIG: {
            LIST: 'system:config:list',
            ADD: 'system:config:add',
            EDIT: 'system:config:edit',
            REMOVE: 'system:config:remove',
        },
        MODULE: {
            LIST: 'system:module:list',
            EDIT: 'system:module:edit',
            REMOVE: 'system:module:remove',
        },
        PERMISSION: {
            LIST: 'system:permission:list',
            ADD: 'system:permission:add',
            EDIT: 'system:permission:edit',
            REMOVE: 'system:permission:remove',
            SYNC: 'system:permission:sync',
        },
    },
    // ===================== 监控管理 =====================
    MONITOR: {
        ONLINE: 'monitor:online:list',
        JOB: 'monitor:job:list',
        LOGIN_LOG: 'monitor:logininfor:list',
        OPERATION_LOG: 'monitor:operlog:list',
        LOG: {
            LIST: 'system:log:list',
            REMOVE: 'system:log:remove',
        },
        CACHE: {
            LIST: 'monitor:cache:list',
            REMOVE: 'monitor:cache:remove',
        },
    },
    // ===================== EMS 业务 =====================
    EMS: {
        ENERGY_TYPE: {
            LIST: 'ems:energy-type:list',
            EDIT: 'ems:energy-type:edit',
            REMOVE: 'ems:energy-type:remove',
        },
        METER: {
            LIST: 'ems:meter:list',
            EDIT: 'ems:meter:edit',
            REMOVE: 'ems:meter:remove',
        },
        METER_POINT: {
            LIST: 'ems:meter-point:list',
            EDIT: 'ems:meter-point:edit',
            REMOVE: 'ems:meter-point:remove',
        },
        ENERGY_UNIT: {
            LIST: 'ems:energy-unit:list',
            EDIT: 'ems:energy-unit:edit',
            REMOVE: 'ems:energy-unit:remove',
        },
        ALARM_CONFIG: {
            LIST: 'ems:alarm-config:list',
            REMOVE: 'ems:alarm-config:remove',
        },
        ALARM_LIMIT_TYPE: {
            LIST: 'ems:alarm-limit-type:list',
            REMOVE: 'ems:alarm-limit-type:remove',
        },
        ALARM_RECORD: {
            LIST: 'ems:alarm-record:list',
            HANDLE: 'ems:alarm-record:handle',
        },
        PRODUCT: {
            LIST: 'ems:product:list',
            EDIT: 'ems:product:edit',
        },
        PRICE_POLICY: {
            LIST: 'ems:price-policy:list',
            EDIT: 'ems:price-policy:edit',
        },
        STATISTICS: {
            LIST: 'ems:statistics:list',
        },
        POLICY: {
            LIST: 'ems:policy:list',
            EDIT: 'ems:policy:edit',
        },
        COST_POLICY_BINDING: {
            LIST: 'ems:cost-policy-binding:list',
            REMOVE: 'ems:cost-policy-binding:remove',
        },
        ENERGY_COST_RECORD: {
            LIST: 'ems:energy-cost-record:list',
            EDIT: 'ems:energy-cost-record:edit',
            REMOVE: 'ems:energy-cost-record:remove',
        },
        PRODUCTION_RECORD: {
            LIST: 'ems:production-record:list',
            EDIT: 'ems:production-record:edit',
            REMOVE: 'ems:production-record:remove',
        },
        BENCHMARK: {
            LIST: 'ems:benchmark:list',
            REMOVE: 'ems:benchmark:remove',
        },
        ENERGY_SAVING_PROJECT: {
            LIST: 'ems:energy-saving:list',
            EDIT: 'ems:energy-saving-project:edit',
            REMOVE: 'ems:energy-saving-project:remove',
        },
        KNOWLEDGE: {
            LIST: 'ems:knowledge:list',
            EDIT: 'ems:knowledge:edit',
            REMOVE: 'ems:knowledge:remove',
        },
        TIME_PERIOD_PRICE: {
            EDIT: 'ems:time-period-price:edit',
            REMOVE: 'ems:time-period-price:remove',
        },
    },
    // 超级管理员权限
    SUPER_ADMIN: '*:*:*',
};

export default PERMISSIONS;
