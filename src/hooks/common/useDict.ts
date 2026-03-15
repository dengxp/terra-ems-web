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

import { useModel } from '@umijs/max';
import { useEffect, useState } from 'react';

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
