import React, { useState, useCallback, useEffect } from "react";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
  description?: string;
  addedAt?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  isLoading: boolean;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string, size: string) => Promise<void>;
  updateQuantity: (id: string, size: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  getItemQuantity: (id: string, size: string) => number;
  isInCart: (id: string, size: string) => boolean;
}

export const [CartProvider, useCart] = createContextHook<CartContextType>(() => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Load cart from storage on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const cartData = await AsyncStorage.getItem("@yemalin_cart");
      if (cartData) {
        setItems(JSON.parse(cartData));
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCart = async (cartItems: CartItem[]) => {
    try {
      await AsyncStorage.setItem("@yemalin_cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  const addToCart = useCallback(async (item: CartItem) => {
    const newItems = await new Promise<CartItem[]>((resolve) => {
      setItems(prev => {
        const existingItem = prev.find(i => i.id === item.id && i.size === item.size);
        let updated;
        if (existingItem) {
          updated = prev.map(i => 
            i.id === item.id && i.size === item.size 
              ? { ...i, quantity: i.quantity + item.quantity, addedAt: new Date().toISOString() }
              : i
          );
        } else {
          updated = [...prev, { ...item, addedAt: new Date().toISOString() }];
        }
        resolve(updated);
        return updated;
      });
    });
    await saveCart(newItems);
  }, []);

  const removeFromCart = useCallback(async (id: string, size: string) => {
    const newItems = await new Promise<CartItem[]>((resolve) => {
      setItems(prev => {
        const updated = prev.filter(item => !(item.id === id && item.size === size));
        resolve(updated);
        return updated;
      });
    });
    await saveCart(newItems);
  }, []);

  const updateQuantity = useCallback(async (id: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id, size);
      return;
    }
    
    const newItems = await new Promise<CartItem[]>((resolve) => {
      setItems(prev => {
        const updated = prev.map(item => 
          item.id === id && item.size === size 
            ? { ...item, quantity }
            : item
        );
        resolve(updated);
        return updated;
      });
    });
    await saveCart(newItems);
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    setItems([]);
    await saveCart([]);
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [items]);

  const getItemQuantity = useCallback((id: string, size: string) => {
    const item = items.find(i => i.id === id && i.size === size);
    return item ? item.quantity : 0;
  }, [items]);

  const isInCart = useCallback((id: string, size: string) => {
    return items.some(i => i.id === id && i.size === size);
  }, [items]);

  return {
    items,
    itemCount,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemQuantity,
    isInCart,
  };
});