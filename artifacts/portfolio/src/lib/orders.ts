import { useState, useEffect, useCallback } from 'react';

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  sellerEmail: string;
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  createdAt: string;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadOrders = useCallback(() => {
    const stored = localStorage.getItem("hb_orders");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setOrders(parsed);
      } catch (e) {
        console.error("Failed to parse orders from local storage");
        setOrders([]);
      }
    } else {
      setOrders([]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadOrders();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "hb_orders") {
        loadOrders();
      }
    };

    const handleCustomSync = () => {
      loadOrders();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('hb_orders_sync', handleCustomSync);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('hb_orders_sync', handleCustomSync);
    };
  }, [loadOrders]);

  const addOrder = (order: Omit<Order, "id" | "createdAt">) => {
    const newOrder: Order = {
      ...order,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    
    const stored = localStorage.getItem("hb_orders");
    let currentOrders: Order[] = [];
    if (stored) {
      try {
        currentOrders = JSON.parse(stored) || [];
      } catch (e) {}
    }

    const updated = [newOrder, ...currentOrders];
    localStorage.setItem("hb_orders", JSON.stringify(updated));
    setOrders(updated);
    window.dispatchEvent(new Event('hb_orders_sync'));
  };

  return { orders, addOrder, isLoaded };
}
