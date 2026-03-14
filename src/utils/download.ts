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
