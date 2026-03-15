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

import React from 'react';
import { Checkbox, Col, Divider, Row } from "antd";
import type { CheckboxChangeEvent } from "antd/lib/checkbox";

type Props = {
    mod: any;
    onModuleChange?: (e: CheckboxChangeEvent, mod: any) => void;
    onPermissionChange?: (e: CheckboxChangeEvent, mod: any, permission: any) => void;
}

const ModulePermission: React.FC<Props> = ({ mod, onModuleChange, onPermissionChange }) => {
    return (
        <div className={'mt-4'}>
            <Checkbox
                className={'font-bold !text-lg'}
                checked={mod.checked}
                indeterminate={mod.indeterminate}
                onChange={(e) => onModuleChange?.(e, mod)}
            >
                {mod.name}
            </Checkbox>
            <Divider className={'my-2 bg-[#f0f0f0]'} />
            <Row gutter={[16, 16]}>
                {
                    mod.permissions?.map((permission: any) => (
                        <Col span={4} key={'col-' + permission.id}>
                            <Checkbox
                                checked={permission.checked}
                                key={'perm-' + permission.id}
                                onChange={(e) => onPermissionChange?.(e, mod, permission)}
                                className={permission.superPermission ? '!text-red-500 font-medium' : ''}
                            >
                                {permission.name}
                                {permission.superPermission && <span className={'text-[12px] opacity-80 ml-1'}>(超级)</span>}
                            </Checkbox>
                        </Col>
                    ))
                }
            </Row>
        </div>
    );
}

export default ModulePermission;
