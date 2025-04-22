import {request} from "@umijs/max";

export function getDictList(dictType: string) {
  return request(
    '/api/system/dict/data/type/' + dictType,
    {
      method: 'get'
    }
  );
}
