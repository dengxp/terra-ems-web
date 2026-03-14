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

import { useModel } from '@umijs/max';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseWebSocketOptions {
    onMessage?: (data: any) => void;
    reconnectAttempts?: number;
    reconnectInterval?: number;
}

/**
 * WebSocket Hook
 */
export const useWebSocket = (options: UseWebSocketOptions = {}) => {
    const { onMessage, reconnectAttempts = 5, reconnectInterval = 5000 } = options;
    const { initialState } = useModel('@@initialState');
    const userId = initialState?.currentUser?.id;

    const [connected, setConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectCountRef = useRef(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const onMessageRef = useRef(onMessage);
    onMessageRef.current = onMessage;

    const connect = useCallback(() => {
        if (!userId || socketRef.current?.readyState === WebSocket.OPEN) return;

        // 根据环境确定 WebSocket 地址
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        // 这里的路径必须与后端 @ServerEndpoint 匹配
        const wsUrl = `${protocol}//${host}/api/websocket/${userId}`;

        console.log('[useWebSocket] Connecting to:', wsUrl);
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log('[useWebSocket] Connected successfully');
            setConnected(true);
            reconnectCountRef.current = 0;
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('[useWebSocket] Message received:', data);
                onMessageRef.current?.(data);
            } catch (e) {
                console.error('[useWebSocket] Parse Error:', e, 'Raw data:', event.data);
            }
        };

        ws.onclose = (event) => {
            console.log('[useWebSocket] Disconnected:', event.code, event.reason);
            setConnected(false);

            // 自动重连逻辑
            if (reconnectCountRef.current < reconnectAttempts) {
                console.log('[useWebSocket] Attempting to reconnect...', reconnectCountRef.current + 1);
                timerRef.current = setTimeout(() => {
                    reconnectCountRef.current += 1;
                    connect();
                }, reconnectInterval);
            }
        };

        ws.onerror = (error) => {
            console.error('[useWebSocket] Error occurred:', error);
            ws.close();
        };
    }, [userId, reconnectAttempts, reconnectInterval]);

    useEffect(() => {
        connect();
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [connect]);

    const sendMessage = (msg: any) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(msg));
        }
    };

    return { connected, sendMessage };
};
