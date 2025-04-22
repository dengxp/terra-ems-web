// src/models/dict.ts
import { useState } from 'react';
import { getDictList } from '@/apis/data';  // 假设你这有 getDicts 方法

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
