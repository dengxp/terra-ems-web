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
