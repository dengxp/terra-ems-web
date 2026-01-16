import { useEffect, useState } from 'react';
import { useModel } from '@umijs/max';

/**
 * 【架构说明】
 * 本系统支持两种字典/常量机制：
 * 
 * 1. Constant (推荐)：基于后端 Java Enum 生成，前端一次性全局拉取。适用于业务逻辑固定、追求性能的场景。
 * 2. Dict (动态)：基于数据库 sys_dict_type / sys_dict_data 配置。支持 UI 样式动态绑定。
 *    适用于需要运营人员动态调整选项、或者需要根据字典值动态改变 Tag 颜色的场景。
 * 
 * @param args 字典类型代码 (如: 'SYS_USER_SEX')
 * @returns 字典项映射对象
 */
export function useDict(...args: string[]) {
  const { getDict, fetchDict } = useModel('dictModel');
  const [dictMap, setDictMap] = useState<Record<string, any[]>>({});

  useEffect(() => {
    args.forEach(async (type) => {
      let d = getDict(type);
      if (!d) {
        d = await fetchDict(type);
      }
      setDictMap(prev => ({ ...prev, [type]: d }));
    });
  }, [args.join(',')]);

  return dictMap;
}
