import {useState, useCallback, useEffect} from 'react';
import { fetchAllMaps, fetchAllOptions } from "@/apis/constant";
import { isEmpty } from "lodash";

export default function useConstantModel() {
  const [optionMap, setOptionMap] = useState<Record<string, Option[]>>({});
  const [mapMaps, setMapMaps] = useState<Record<string, Record<any, any>>>({});

  const fetchOptions = useCallback(async () => {
    if (!isEmpty(optionMap)) return;
    const result = await fetchAllOptions();
    setOptionMap({ ...result.data });
  }, [optionMap]);

  const fetchMaps = useCallback(async () => {
    if (!isEmpty(mapMaps)) return;
    const result = await fetchAllMaps();
    setMapMaps({ ...result.data });
  }, [mapMaps]);

  // 自动初始化数据
  useEffect(() => {
    void fetchOptions();
    void fetchMaps();
  }, []);

  return {
    optionMap,
    mapMaps,
    fetchOptions,
    fetchMaps,
  };
}
