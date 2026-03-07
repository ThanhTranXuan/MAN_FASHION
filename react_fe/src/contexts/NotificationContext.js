import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import OrderService from 'services/OrderService';
import ReturnOrderService from 'services/ReturnOrderService';
import { useUser } from 'contexts/UserContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useUser();

  const [hasNewOrder, setHasNewOrder] = useState(false);
  const [hasNewReturn, setHasNewReturn] = useState(false);

  const stompClientRef = useRef(null);

  // 🟢 WebSocket connect + real-time
  useEffect(() => {
    // ❗ Chỉ ADMIN + EMPLOYEE mới cần WebSocket
    if (!isAuthenticated || !['ADMIN', 'EMPLOYEE'].includes(user?.roleName)) {
      console.log('⏭ Skip WebSocket (not admin/employee)');
      return;
    }

    const BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

    const client = new Client({
      reconnectDelay: 5000,
      webSocketFactory: () => new SockJS(`${BASE}/ws`),
    });

    client.onConnect = () => {
      console.log('🟢 WebSocket connected');

      // =========================
      // NEW ORDER
      // =========================
      client.subscribe('/topic/new-order', (msg) => {
        console.log('📥 WS new-order:', msg.body);

        let data;
        try {
          data = JSON.parse(msg.body);
        } catch {
          return;
        }

        const lastFetch = Number(
          localStorage.getItem('lastFetch:/admin/order-management'),
        );

        const isInPage = window.location.pathname.includes(
          '/admin/order-management',
        );

        if (isInPage) return;

        if (!lastFetch || data.timestamp > lastFetch) {
          setHasNewOrder(true);
        }
      });

      // =========================
      // NEW RETURN
      // =========================
      client.subscribe('/topic/new-return', (msg) => {
        console.log('📥 WS new-return:', msg.body);

        let data;
        try {
          data = JSON.parse(msg.body);
        } catch {
          return;
        }

        const lastFetch = Number(
          localStorage.getItem('lastFetch:/admin/return-management'),
        );

        const isInPage = window.location.pathname.includes(
          '/admin/return-management',
        );

        if (isInPage) return;

        if (!lastFetch || data.timestamp > lastFetch) {
          setHasNewReturn(true);
        }
      });
    };

    client.activate();
    stompClientRef.current = client;

    return () => client.deactivate();
  }, [isAuthenticated, user]);

  // 🔍 Kiểm tra missed events khi online lại
  useEffect(() => {
    const checkMissed = async () => {
      // ❗ MUST HAVE ADMIN OR EMPLOYEE
      if (!isAuthenticated || !['ADMIN', 'EMPLOYEE'].includes(user?.roleName)) {
        console.log('⏭ Skip has-new check (not admin/employee)');
        return;
      }

      const lastOrderFetch = Number(
        localStorage.getItem('lastFetch:/admin/order-management') || 0,
      );
      const lastReturnFetch = Number(
        localStorage.getItem('lastFetch:/admin/return-management') || 0,
      );

      try {
        if (lastOrderFetch) {
          const res = await OrderService.hasNewSince(lastOrderFetch);
          if (res.data === true) setHasNewOrder(true);
        }
      } catch (err) {
        console.error('❌ Failed to check new orders:', err);
      }

      try {
        if (lastReturnFetch) {
          const res = await ReturnOrderService.hasNewSince(lastReturnFetch);
          if (res.data === true) setHasNewReturn(true);
        }
      } catch (err) {
        console.error('❌ Failed to check new returns:', err);
      }
    };

    const handleOnline = () => {
      console.log('🌐 Back online');
      checkMissed();
    };

    window.addEventListener('online', handleOnline);

    // Lần đầu vào khi đã online → check luôn
    if (navigator.onLine) checkMissed();

    return () => window.removeEventListener('online', handleOnline);
  }, [isAuthenticated, user]);

  // 🧽 CLEAR BADGE
  const clearNotification = (path) => {
    if (path === '/admin/order-management') {
      setHasNewOrder(false);
      localStorage.setItem(`lastFetch:${path}`, Date.now());
    }

    if (path === '/admin/return-management') {
      setHasNewReturn(false);
      localStorage.setItem(`lastFetch:${path}`, Date.now());
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        hasNewOrder,
        hasNewReturn,
        clearNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
