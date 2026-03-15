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

import { useAccess } from '@umijs/max';
import React from 'react';

/**
 * 权限控制组件属性
 */
interface PermissionProps {
    /** 
     * 权限标识符
     * 支持单个字符串，或字符串数组
     */
    code?: string | string[];
    /**
     * 校验逻辑
     * - or: 满足其中之一即有权限 (默认)
     * - and: 必须全部满足才有权限
     */
    logic?: 'or' | 'and';
    /** 
     * 无权限时的处理模式
     * - hide: 彻底隐藏 (默认)
     * - disable: 禁用组件 (通过注入 disabled 属性)
     */
    mode?: 'hide' | 'disable';
    /** 子组件 */
    children: React.ReactElement;
    /** 无权限时的替代内容 (仅在 hide 模式下有效) */
    fallback?: React.ReactNode;
}

/**
 * Name: Permission
 * Description: 增强型权限控制组件，支持多码逻辑校验与隐藏/禁用模式
 */
const Permission: React.FC<PermissionProps> = ({
    code,
    logic = 'or',
    mode = 'hide',
    children,
    fallback,
}) => {
    const { hasPermission } = useAccess();

    // 若未配置权限标识，则默认允许访问
    if (!code || (Array.isArray(code) && code.length === 0)) {
        return children;
    }

    // 执行校验逻辑
    let accessible = false;
    if (Array.isArray(code)) {
        if (logic === 'or') {
            accessible = code.some(p => hasPermission(p));
        } else {
            accessible = code.every(p => hasPermission(p));
        }
    } else {
        accessible = hasPermission(code);
    }

    // 有权限，直接渲染
    if (accessible) {
        return children;
    }

    // 无权限处理
    if (mode === 'hide') {
        return fallback ? <>{fallback}</> : null;
    }

    if (mode === 'disable') {
        // 注入 disabled 属性
        return React.cloneElement(children, {
            disabled: true,
            title: '您没有权限执行此操作'
        } as any);
    }

    return null;
};

export default Permission;
