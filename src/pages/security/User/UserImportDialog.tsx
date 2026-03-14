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

import { downloadImportResult, exportTemplate, importUser } from "@/apis";
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import { downloadFailed, downloadSuccess } from "@/utils/download";
import { ProFormCheckbox, ProFormUploadDragger } from "@ant-design/pro-components";
import { Button, Form, message, Upload } from "antd";
import type { UploadFile } from "antd/es/upload";
import { useState } from 'react';

type Props = ProModalFormProps & {
  onReload?: () => void;
};

const accept = 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const UserImportDialog = (props: Props) => {
  const { onReload, ...restProps } = props;
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [importStats, setImportStats] = useState<{ total: number, successCount: number, failureCount: number, hasFailure: boolean } | null>(null);
  const [importResultData, setImportResultData] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const handleExportTemplate = async () => {
    exportTemplate()
      .then(data => {
        downloadSuccess(data, `user_template_${new Date().getTime()}.xlsx`);
      })
      .catch((error: any) => {
        downloadFailed(error);
      });
  }

  const handleDownloadResult = async () => {
    if (!importResultData) return;
    try {
      const blob = await downloadImportResult(importResultData);
      void downloadSuccess(blob, "用户导入结果.xlsx");
    } catch (e) {
      downloadFailed(e);
    }
  }

  const beforeUpload = (file: UploadFile) => {
    const isExcel = /(\.xls|\.xlsx)$/.test(file.name);
    if (!isExcel) {
      void messageApi.error('仅支持 xls/xlsx 文件');
    }
    return isExcel || Upload.LIST_IGNORE;
  }

  const onFinish = async (values: Record<string, any>) => {
    if (importResult) {
      props.onOpenChange?.(false);
      onReload?.();
      return true;
    }

    const { files, updateSupport } = values;
    if (!files || files.length === 0) {
      void messageApi.error('请上传文件');
      return false;
    }

    const formData = new FormData();
    formData.append('file', files[0].originFileObj);
    formData.append('updateSupport', updateSupport || false);
    setUploading(true);
    try {
      const res = await importUser(formData);
      const data = res.data || {};
      const { total, successCount, failureCount, fileUrl } = data;

      setImportStats({
        total: total || 0,
        successCount: successCount || 0,
        failureCount: failureCount || 0,
        hasFailure: failureCount > 0
      });

      if (fileUrl) {
        setImportResultData(fileUrl);
      }
      setImportResult('success');
      onReload?.();
      // Keep dialog open to show result
      return false;
    } catch (error: any) {
      // Failure case (partial failure or system error)
      const res = error.data || error.response?.data || {};
      const data = res.data || {};

      if (data && (typeof data.total === 'number' || typeof data.total === 'string')) {
        const { total, successCount, failureCount, fileUrl } = data;
        setImportStats({
          total: total || 0,
          successCount: successCount || 0,
          failureCount: failureCount || 0,
          hasFailure: true
        });
        if (fileUrl) {
          setImportResultData(fileUrl);
        }
        setImportResult('error');
      } else {
        void messageApi.error(res.message || error.message || '导入失败');
        return false; // Close dialog or just show error? If catastrophic, maybe let user retry.
      }
      onReload?.();
      return false;
    } finally {
      setUploading(false);
    }
  }

  return (
    <ProModalForm {...restProps}
      width={450}
      form={form}
      onFinish={onFinish}
      submitter={{
        searchConfig: {
          submitText: importResult ? '关闭' : '确定',
          resetText: '取消',
        },
        render: (props, defaultDoms) => {
          if (importResult) {
            return [
              <Button key="close" type="primary" onClick={() => props.form?.submit()}>
                关闭
              </Button>,
            ];
          }
          return defaultDoms;
        },
      }}
      modalProps={{
        ...props.modalProps,
        destroyOnClose: true,
        afterClose: () => {
          form.resetFields();
          setImportResult(null);
          setImportStats(null);
          setImportResultData(null);
          props.modalProps?.afterClose?.();
        }
      }}
    >
      {contextHolder}
      {importResult && importStats ? (
        <div className="mb-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-gray-700 flex flex-col gap-3">
            <span className="font-bold text-base text-gray-800">
              {importStats.hasFailure ? '导入完成（存在异常）' : '导入成功'}
            </span>
            <div className="flex items-center gap-6 text-sm">
              <span>总条数：<strong>{importStats.total}</strong></span>
              <span>成功：<strong className="text-green-600">{importStats.successCount}</strong></span>
              <span>失败：<strong className="text-red-600">{importStats.failureCount}</strong></span>
            </div>
            {importResultData && (
              <div className="text-right">
                <a className="text-sm underline text-blue-600 hover:text-blue-800 cursor-pointer" onClick={handleDownloadResult}>
                  下载导入结果
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <ProFormUploadDragger formItemProps={{ className: 'mb-1' }}
            name="files"
            disabled={uploading}
            fieldProps={{
              multiple: false,
              accept,
              maxCount: 1,
              beforeUpload
            }}
            description={'只支持单个文件上传'}
            rules={[{ required: true, message: '请上传文件' }]}
          />
          <ProFormCheckbox name={'updateSupport'} initialValue={false}>允许更新已经存在的用户数据</ProFormCheckbox>
          <div className={'text-gray-500 text-sm mt-2'}>
            <p>1. 仅允许导入xls、xlsx格式文件。</p>
            <p>2. <span className="text-red-500">新用户默认密码为: 123456</span></p>
            <p>3. <Button variant={'link'} color={'primary'} onClick={handleExportTemplate} className={'p-0 h-auto'}>下载模板</Button></p>
          </div>
        </>
      )
      }
    </ProModalForm >
  );
}

export default UserImportDialog;
