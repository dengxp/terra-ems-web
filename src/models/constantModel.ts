import { fetchAllMaps, fetchAllOptions } from '@/apis/constant';
import { useCallback, useEffect, useState } from 'react';

/**
 * 选项类型
 */
interface Option {
  label: string;
  value: any;
  color?: string;
}

/**
 * 常量缓存配置
 */
const CACHE_KEY_OPTIONS = 'terra_constants_options';
const CACHE_KEY_MAPS = 'terra_constants_maps';
const CACHE_TTL = 30 * 60 * 1000; // 30分钟缓存有效期

interface CacheData<T> {
  data: T;
  timestamp: number;
}

/**
 * 从 localStorage 读取缓存
 */
function getFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp }: CacheData<T> = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
    // 缓存已过期，清除
    localStorage.removeItem(key);
    return null;
  } catch {
    return null;
  }
}

/**
 * 保存到 localStorage 缓存
 */
function saveToCache<T>(key: string, data: T): void {
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch {
    // localStorage 可能已满或不可用，忽略
  }
}

/**
 * 常量模型 - 使用 localStorage 缓存
 * 
 * 缓存策略：
 * - 30分钟内使用 localStorage 缓存，不请求后端
 * - 超过30分钟或首次加载，请求后端并更新缓存
 * - 可通过 clearCache() 强制刷新
 */
export default function useConstantModel() {
  // 初始化时尝试从缓存读取
  const [optionMap, setOptionMap] = useState<Record<string, Option[]>>(() => {
    return getFromCache<Record<string, Option[]>>(CACHE_KEY_OPTIONS) || {};
  });

  const [mapMaps, setMapMaps] = useState<Record<string, Record<any, any>>>(() => {
    return getFromCache<Record<string, Record<any, any>>>(CACHE_KEY_MAPS) || {};
  });

  const [loading, setLoading] = useState(false);

  /**
   * 获取选项数据（带缓存）
   */
  const fetchOptions = useCallback(async (forceRefresh = false) => {
    // 如果不是强制刷新，检查缓存
    if (!forceRefresh) {
      const cached = getFromCache<Record<string, Option[]>>(CACHE_KEY_OPTIONS);
      if (cached) {
        setOptionMap(cached);
        return;
      }
    }

    setLoading(true);
    try {
      const result = await fetchAllOptions();
      if (result.data) {
        setOptionMap(result.data);
        saveToCache(CACHE_KEY_OPTIONS, result.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 获取映射数据（带缓存）
   */
  const fetchMaps = useCallback(async (forceRefresh = false) => {
    // 如果不是强制刷新，检查缓存
    if (!forceRefresh) {
      const cached = getFromCache<Record<string, Record<any, any>>>(CACHE_KEY_MAPS);
      if (cached) {
        setMapMaps(cached);
        return;
      }
    }

    try {
      const result = await fetchAllMaps();
      if (result.data) {
        setMapMaps(result.data);
        saveToCache(CACHE_KEY_MAPS, result.data);
      }
    } catch {
      // 忽略错误
    }
  }, []);

  /**
   * 清除缓存并强制刷新
   */
  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY_OPTIONS);
    localStorage.removeItem(CACHE_KEY_MAPS);
    void fetchOptions(true);
    void fetchMaps(true);
  }, [fetchOptions, fetchMaps]);

  // 初始化时加载数据
  useEffect(() => {
    void fetchOptions();
    void fetchMaps();
  }, [fetchOptions, fetchMaps]);

  return {
    optionMap,
    mapMaps,
    loading,
    fetchOptions,
    fetchMaps,
    clearCache,
  };
}
