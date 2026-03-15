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

// src/models/dict.ts
import { getDictList } from '@/apis/data'; // 假设你这有 getDicts 方法
import { useState } from 'react';

interface DictItem {
  label: string;
  value: string;
  elTagType?: string;
  elTagClass?: string;
}

export default () => {
  const [dict, setDict] = useState<Record<string, DictItem[]>>({});

  const getDict = (key: string) => dict[key];
  const setDictValue = (key: string, value: DictItem[]) => {
    setDict(prev => ({ ...prev, [key]: value }));
  };
  const removeDict = (key: string) => {
    setDict(prev => {
      const newDict = { ...prev };
      delete newDict[key];
      return newDict;
    });
  };
  const cleanDict = () => setDict({});

  const fetchDict = async (key: string) => {
    const resp = await getDictList(key);
    const result = resp.data.map((p: any) => ({
      label: p.dictLabel,
      value: p.dictValue,
      elTagType: p.listClass,
      elTagClass: p.cssClass,
    }));
    setDictValue(key, result);
    return result;
  };

  return {
    dict,
    getDict,
    setDictValue,
    removeDict,
    cleanDict,
    fetchDict,
  };
};
