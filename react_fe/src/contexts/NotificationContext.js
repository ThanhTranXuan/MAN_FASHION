import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import OrderService from 'services/OrderService';
import ReturnOrderService from 'services/ReturnOrderService';
import AuthService from 'services/AuthService';
import { useUser } from 'contexts/UserContext';
import { useAppToast } from 'utils/ToastHelper';
import { translateOrderStatus } from 'utils/OrderDisplayHelper';

const NotificationContext = createContext();

const parseMessage = (message) => {
  try {
    return JSON.parse(message.body);
  } catch {
    return null;
  }
};

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useUser();
  const toast = useAppToast();

  const [hasNewOrder, setHasNewOrder] = useState(false);
  const [hasNewReturn, setHasNewReturn] = useState(false);
  const [hasProfileOrderUpdate, setHasProfileOrderUpdate] = useState(false);
  const [hasProfileReturnUpdate, setHasProfileReturnUpdate] = useState(false);
  const [refreshOrderSignal, setRefreshOrderSignal] = useState(0);
  const [refreshReturnSignal, setRefreshReturnSignal] = useState(0);
  const [latestOrderStatusEvent, setLatestOrderStatusEvent] = useState(null);
  const [latestReturnStatusEvent, setLatestReturnStatusEvent] = useState(null);
  const [latestUserNotification, setLatestUserNotification] = useState(null);
  const [userUnreadCount, setUserUnreadCount] = useState(0);

  const isStaff = ['ADMIN', 'EMPLOYEE'].includes(user?.roleName);

  useEffect(() => {
    if (!isAuthenticated || !user) return undefined;

    const baseUrl =
      process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
    const client = new Client({
      reconnectDelay: 5000,
      webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${AuthService.getAccessToken() || ''}`,
      },
    });

    client.onConnect = () => {
      if (isStaff) {
        client.subscribe('/topic/new-order', (message) => {
          const data = parseMessage(message);
          if (!data) return;

          setRefreshOrderSignal((value) => value + 1);
          if (!window.location.pathname.includes('/admin/order-management')) {
            setHasNewOrder(true);
            toast.info('Có đơn hàng mới.');
          }
        });

        client.subscribe('/topic/new-return', (message) => {
          const data = parseMessage(message);
          if (!data) return;

          setRefreshReturnSignal((value) => value + 1);
          if (!window.location.pathname.includes('/admin/return-management')) {
            setHasNewReturn(true);
            toast.info('Có yêu cầu hoàn trả mới.');
          }
        });
      }

      if (isStaff) {
        client.subscribe('/topic/order-status', (message) => {
          const data = parseMessage(message);
          if (!data) return;

          setLatestOrderStatusEvent(data);
          const isOnOrderPage = window.location.pathname.includes(
            '/admin/order-management',
          );
          if (!isOnOrderPage) {
            setHasNewOrder(true);
            toast.info(`Đơn hàng ${data.orderCode} đã cập nhật trạng thái.`);
          }
        });
      } else {
        client.subscribe(`/topic/users/${user.id}/notifications`, (message) => {
          const data = parseMessage(message);
          if (!data || data.type !== 'ORDER_STATUS_UPDATED') return;

          setLatestOrderStatusEvent(data);
          setLatestUserNotification(data);
          setUserUnreadCount((value) => value + 1);
          setRefreshOrderSignal((value) => value + 1);
          setHasProfileOrderUpdate(true);
          toast.info(
            `Đơn hàng ${data.orderCode} đã chuyển sang: ${translateOrderStatus(
              data.status,
            )}`,
          );
        });
      }

      client.subscribe('/topic/return-status', (message) => {
        const data = parseMessage(message);
        if (!data) return;

        const belongsToUser = String(data.userId) === String(user.id);
        if (isStaff) {
          setLatestReturnStatusEvent(data);
          const isOnReturnPage = window.location.pathname.includes(
            '/admin/return-management',
          );
          if (!isOnReturnPage) {
            setHasNewReturn(true);
            toast.info(`Yêu cầu hoàn trả ${data.returnCode} đã cập nhật.`);
          }
        } else if (belongsToUser) {
          setRefreshReturnSignal((value) => value + 1);
          setHasProfileReturnUpdate(true);
          toast.info(`Yêu cầu hoàn trả ${data.returnCode} đã cập nhật.`);
        }
      });
    };

    client.activate();
    return () => client.deactivate();
  }, [isAuthenticated, isStaff, toast, user]);

  useEffect(() => {
    if (!isAuthenticated || !isStaff) return undefined;

    const checkMissed = async () => {
      const lastOrderFetch = Number(
        localStorage.getItem('lastFetch:/admin/order-management') || 0,
      );
      const lastReturnFetch = Number(
        localStorage.getItem('lastFetch:/admin/return-management') || 0,
      );

      try {
        if (lastOrderFetch) {
          const response = await OrderService.hasNewSince(lastOrderFetch);
          if (response.data?.data === true) setHasNewOrder(true);
        }
      } catch (error) {
        console.error('Failed to check new orders:', error);
      }

      try {
        if (lastReturnFetch) {
          const response =
            await ReturnOrderService.hasNewSince(lastReturnFetch);
          if (response.data?.data === true) setHasNewReturn(true);
        }
      } catch (error) {
        console.error('Failed to check new returns:', error);
      }
    };

    window.addEventListener('online', checkMissed);
    if (navigator.onLine) checkMissed();
    return () => window.removeEventListener('online', checkMissed);
  }, [isAuthenticated, isStaff]);

  const clearNotification = useCallback((path) => {
    if (path === '/admin/order-management') {
      setHasNewOrder(false);
      localStorage.setItem(`lastFetch:${path}`, Date.now());
    }

    if (path === '/admin/return-management') {
      setHasNewReturn(false);
      localStorage.setItem(`lastFetch:${path}`, Date.now());
    }
  }, []);

  const clearProfileNotification = useCallback((type) => {
    if (type === 'order') {
      setHasProfileOrderUpdate(false);
      setUserUnreadCount(0);
    }
    if (type === 'return') setHasProfileReturnUpdate(false);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        hasNewOrder,
        hasNewReturn,
        hasProfileOrderUpdate,
        hasProfileReturnUpdate,
        refreshOrderSignal,
        refreshReturnSignal,
        latestOrderStatusEvent,
        latestReturnStatusEvent,
        latestUserNotification,
        userUnreadCount,
        clearNotification,
        clearProfileNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
