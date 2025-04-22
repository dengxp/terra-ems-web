import { useEffect, useState } from 'react';
import { useModel } from '@umijs/max';

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
