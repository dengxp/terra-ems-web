import errorCode from "@/config/errorCode";
import { message } from "antd";
import { saveAs } from "file-saver";

export function blobValidate(data: any) {
  return data.type !== 'application/json'
}

export async function downloadSuccess(data: any, filename: string) {
  const isBlob = blobValidate(data);
  if(isBlob) {
    const blob = new Blob([data]);
    saveAs(blob, filename);
  } else {
    const resText = await data.text();
    const rspObj = JSON.parse(resText);
    const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default'];
    message.error(errMsg);
  }
}

export function downloadFailed(error: any) {
  if(error?.data?.size) { // is blob
    const reader = new FileReader();
    let data = error.data;
    reader.readAsText(data, 'utf-8');
    reader.onload = function () {
      data = JSON.parse(reader.result as string);
      message.error(data.message || '下载文件失败');
    }
  }
}
