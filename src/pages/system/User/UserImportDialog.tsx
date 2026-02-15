import { exportTemplate, importUser } from "@/apis";
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import { downloadFailed, downloadSuccess } from "@/utils/download";
import { ProFormCheckbox, ProFormUploadDragger } from "@ant-design/pro-components";
import { Button, Form, GetProp, message, Upload, UploadProps } from "antd";
import type { UploadFile } from "antd/es/upload";
import { useState } from 'react';

type Props = ProModalFormProps;

const accept = 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const UserImportDialog = (props: Props) => {
  const [uploading, setUploading] = useState(false);
  const [_fileList, _setFileList] = useState<UploadFile[]>([]);
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

  const beforeUpload = (file: UploadFile) => {
    const isExcel = /(\.xls|\.xlsx)$/.test(file.name);
    if (!isExcel) {
      void messageApi.error('仅支持 xls/xlsx 文件');
    }
    return isExcel || Upload.LIST_IGNORE;
  }

  const onFinish = async (values: Record<string, any>) => {
    const { files, updateSupport } = values;
    const formData = new FormData();
    formData.append('file', files[0].originFileObj);
    formData.append('updateSupport', updateSupport);
    setUploading(true);
    try {
      const res = await importUser(formData);
      void messageApi.success(res.message || '导入用户成功');
    } catch (error: any) {
      void messageApi.error(<span dangerouslySetInnerHTML={{ __html: error.message }} />);
    } finally {
      setUploading(false);
    }
  }

  return (
    <ProModalForm {...props}
      width={400}
      form={form}
      onFinish={onFinish}
    >
      {contextHolder}
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
      <p className={'text-gray-500'}>
        仅允许导入xls、xlsx格式文件
        <Button variant={'link'} color={'primary'} onClick={handleExportTemplate}>下载模板</Button>
      </p>
    </ProModalForm>
  );
}

export default UserImportDialog;
