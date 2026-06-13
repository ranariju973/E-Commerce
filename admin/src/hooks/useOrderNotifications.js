import { useEffect, useRef } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

export const useOrderNotifications = (token) => {
  const lastOrderIdRef = useRef(null);

  useEffect(() => {
    // Request permission for push notifications
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    let timeoutId;

    const checkForNewOrders = async () => {
      try {
        const response = await axios.post(`${backendUrl}/api/order/list`, {}, { headers: { token } });
        if (response.data.success) {
          const orders = response.data.orders;
          if (orders.length > 0) {
            // Orders are sorted by date descending, so orders[0] is the newest
            const latestOrderId = orders[0]._id;
            
            if (lastOrderIdRef.current && lastOrderIdRef.current !== latestOrderId) {
              // We have a new order!
              const newOrder = orders[0];
              const title = '🛍️ New Order Received!';
              const body = `Order from ${newOrder.address.firstName} ${newOrder.address.lastName} for ₹${newOrder.amount}`;

              // Show browser notification if allowed
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, { body });
              }

              // Show toast notification
              toast.info(`${title} ${body}`);
            }

            lastOrderIdRef.current = latestOrderId;
          }
        }
      } catch (error) {
        console.error('Error checking for new orders:', error);
      } finally {
        // Poll every 30 seconds
        timeoutId = setTimeout(checkForNewOrders, 30000);
      }
    };

    checkForNewOrders();

    return () => clearTimeout(timeoutId);
  }, [token]);
};
