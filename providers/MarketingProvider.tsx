import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { emailStorage } from '@/lib/emailStorage';
import { ReminderSystem } from '@/lib/reminderSystem';

interface MarketingState {
  // Email & SMS Automation
  klaviyoIntegration: boolean;
  postscriptIntegration: boolean;
  
  // Automation Flows
  abandonedCartFlow: {
    enabled: boolean;
    emailTiming: number[]; // [1hr, 24hr]
    smsTiming: number[];
    urgencyMessages: string[];
    discountOffers: string[];
  };
  
  prePurchaseFlow: {
    enabled: boolean;
    welcomeSeries: string[];
    brandStory: string;
    qualityPromise: string;
    stylingIdeas: string[];
  };
  
  postPurchaseFlow: {
    enabled: boolean;
    thankYouMessage: string;
    deliveryInfo: string;
    stylingTips: string[];
    reviewRequest: string;
  };
  
  winBackFlow: {
    enabled: boolean;
    inactivityDays: number; // 60 days
    exclusiveOffer: string;
  };
  
  // Conversion Boosters
  firstOrderDiscount: {
    enabled: boolean;
    percentage: number;
    popupTiming: number; // seconds
  };
  
  freeShippingThreshold: {
    enabled: boolean;
    amount: number;
  };
  
  scarcityMessages: {
    enabled: boolean;
    lowStockThreshold: number;
    messages: string[];
  };
  
  // Customer Tracking
  vipSegmentation: {
    enabled: boolean;
    spendingThreshold: number; // $500+
    benefits: string[];
  };
  
  // Luxury Scarcity Strategy
  luxuryStrategy: {
    dropStrategy: 'supreme' | 'limited' | 'exclusive';
    maxPiecesPerDrop: number;
    anticipationPeriod: number; // days
    exclusiveAccess: {
      enabled: boolean;
      earlyAccessHours: number; // 48h
      memberDiscount: number; // 30%
    };
  };
}

interface MarketingActions {
  // Email Automation
  sendAbandonedCartEmail: (email: string, cartItems: any[]) => Promise<void>;
  sendWelcomeEmail: (email: string) => Promise<void>;
  sendPostPurchaseEmail: (email: string, orderDetails: any) => Promise<void>;
  sendWinBackEmail: (email: string) => Promise<void>;
  
  // SMS Automation
  sendAbandonedCartSMS: (phone: string, cartItems: any[]) => Promise<void>;
  sendShippingUpdateSMS: (phone: string, trackingInfo: any) => Promise<void>;
  
  // Conversion Tracking
  trackConversion: (event: string, data: any) => void;
  updateVIPStatus: (userId: string, totalSpent: number) => void;
  
  // Scarcity Management
  createScarcityAlert: (productId: string, stock: number) => void;
  triggerDropCountdown: (dropDate: Date) => void;
  
  // Luxury Brand Actions
  addToWaitlist: (email: string, productId?: string) => Promise<void>;
  grantEarlyAccess: (userId: string) => Promise<void>;
  createExclusiveDrop: (products: any[], memberOnly: boolean) => Promise<void>;
}

const defaultMarketingState: MarketingState = {
  klaviyoIntegration: true,
  postscriptIntegration: true,
  
  abandonedCartFlow: {
    enabled: true,
    emailTiming: [1, 24], // 1hr, 24hr
    smsTiming: [2, 48], // 2hr, 48hr
    urgencyMessages: [
      "Your exclusive pieces are waiting...",
      "Only a few left in stock - secure yours now",
      "Final reminder: Your cart expires in 2 hours"
    ],
    discountOffers: [
      "Complete your order and save 10%",
      "Exclusive 15% off - today only",
      "Final chance: 20% off your cart"
    ]
  },
  
  prePurchaseFlow: {
    enabled: true,
    welcomeSeries: [
      "Welcome to YÈMALÍN - Where Luxury Meets Scarcity",
      "The Art of Genuine Exclusivity",
      "Your Journey to Elite Fashion Begins"
    ],
    brandStory: "Born from the belief that true luxury lies in scarcity, YÈMALÍN creates pieces that define exclusivity.",
    qualityPromise: "Every piece is crafted with meticulous attention to detail using only the finest materials.",
    stylingIdeas: [
      "Minimalist Luxury: Less is More",
      "Timeless Pieces for Modern Icons",
      "Building Your Capsule Wardrobe"
    ]
  },
  
  postPurchaseFlow: {
    enabled: true,
    thankYouMessage: "Welcome to the exclusive circle. Your piece is being prepared with care.",
    deliveryInfo: "Your order will arrive in premium packaging within 2-3 business days.",
    stylingTips: [
      "How to care for your YÈMALÍN piece",
      "Styling your new exclusive item",
      "Building a luxury wardrobe"
    ],
    reviewRequest: "Share your YÈMALÍN experience with our community"
  },
  
  winBackFlow: {
    enabled: true,
    inactivityDays: 60,
    exclusiveOffer: "We miss you. Here's an exclusive 25% off your next purchase."
  },
  
  firstOrderDiscount: {
    enabled: true,
    percentage: 15,
    popupTiming: 30 // 30 seconds
  },
  
  freeShippingThreshold: {
    enabled: true,
    amount: 150
  },
  
  scarcityMessages: {
    enabled: true,
    lowStockThreshold: 5,
    messages: [
      "Only {stock} left in stock",
      "Final pieces remaining",
      "Almost sold out - secure yours now",
      "Last chance - only {stock} remaining"
    ]
  },
  
  vipSegmentation: {
    enabled: true,
    spendingThreshold: 500,
    benefits: [
      "48-hour early access to all drops",
      "30% member-only pricing",
      "Exclusive collections",
      "Priority customer service",
      "Personal styling consultation"
    ]
  },
  
  luxuryStrategy: {
    dropStrategy: 'supreme',
    maxPiecesPerDrop: 50,
    anticipationPeriod: 14, // 2 weeks
    exclusiveAccess: {
      enabled: true,
      earlyAccessHours: 48,
      memberDiscount: 30
    }
  }
};

export const [MarketingProvider, useMarketing] = createContextHook(() => {
  const [state, setState] = useState<MarketingState>(defaultMarketingState);
  const [waitlistCount, setWaitlistCount] = useState<number>(3247);
  const [activeDrops, setActiveDrops] = useState<any[]>([]);
  const [conversionEvents, setConversionEvents] = useState<any[]>([]);
  
  // Load marketing state from storage
  useEffect(() => {
    const loadMarketingState = async () => {
      try {
        const stored = await AsyncStorage.getItem('marketing_state');
        if (stored) {
          setState(JSON.parse(stored));
        }
        
        const storedWaitlist = await AsyncStorage.getItem('waitlist_count');
        if (storedWaitlist) {
          setWaitlistCount(parseInt(storedWaitlist));
        }
      } catch (error) {
        console.error('Failed to load marketing state:', error);
      }
    };
    
    loadMarketingState();
  }, []);

  // Start reminder system on mount
  useEffect(() => {
    if (state.abandonedCartFlow.enabled) {
      ReminderSystem.start();
    }
    
    return () => {
      ReminderSystem.stop();
    };
  }, [state.abandonedCartFlow.enabled]);
  
  // Save marketing state to storage
  const saveMarketingState = useCallback(async (newState: MarketingState) => {
    try {
      await AsyncStorage.setItem('marketing_state', JSON.stringify(newState));
      setState(newState);
    } catch (error) {
      console.error('Failed to save marketing state:', error);
    }
  }, []);
  
  // Email Automation Functions
  const sendAbandonedCartEmail = useCallback(async (email: string, cartItems: any[]) => {
    console.log('🔥 ABANDONED CART EMAIL:', { email, cartItems });
    
    // Save email if not already saved
    await emailStorage.saveEmail(email, 'cart', {
      cartValue: cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
      cartItems,
    });
    
    // Save abandoned cart
    await emailStorage.saveAbandonedCart(email, cartItems);
    
    // Simulate Klaviyo API call
    console.log('Email data:', {
      to: email,
      template: 'abandoned_cart_v1',
      data: {
        cartItems,
        urgencyMessage: state.abandonedCartFlow.urgencyMessages[0],
        discountOffer: state.abandonedCartFlow.discountOffers[0],
        scarcityAlert: cartItems.some(item => item.stock <= 3)
      }
    });
    
    // Track conversion event
    const conversionEvent = {
      event: 'abandoned_cart_email_sent',
      data: { email, cartValue: cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) },
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setConversionEvents(prev => [...prev, conversionEvent]);
    console.log('📊 CONVERSION EVENT:', conversionEvent);
  }, [state.abandonedCartFlow.urgencyMessages, state.abandonedCartFlow.discountOffers]);
  
  const sendWelcomeEmail = useCallback(async (email: string) => {
    console.log('✨ WELCOME EMAIL:', { email });
    
    console.log('Email data:', {
      to: email,
      template: 'welcome_series_v1',
      data: {
        brandStory: state.prePurchaseFlow.brandStory,
        qualityPromise: state.prePurchaseFlow.qualityPromise,
        exclusiveOffer: state.firstOrderDiscount.percentage
      }
    });
    
    const conversionEvent = {
      event: 'welcome_email_sent',
      data: { email },
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setConversionEvents(prev => [...prev, conversionEvent]);
    console.log('📊 CONVERSION EVENT:', conversionEvent);
  }, [state.prePurchaseFlow.brandStory, state.prePurchaseFlow.qualityPromise, state.firstOrderDiscount.percentage]);
  
  const sendPostPurchaseEmail = useCallback(async (email: string, orderDetails: any) => {
    console.log('🎉 POST-PURCHASE EMAIL:', { email, orderDetails });
    
    console.log('Email data:', {
      to: email,
      template: 'post_purchase_v1',
      data: {
        orderDetails,
        thankYouMessage: state.postPurchaseFlow.thankYouMessage,
        deliveryInfo: state.postPurchaseFlow.deliveryInfo,
        stylingTips: state.postPurchaseFlow.stylingTips
      }
    });
    
    const conversionEvent = {
      event: 'post_purchase_email_sent',
      data: { email, orderValue: orderDetails.total },
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setConversionEvents(prev => [...prev, conversionEvent]);
    console.log('📊 CONVERSION EVENT:', conversionEvent);
  }, [state.postPurchaseFlow.thankYouMessage, state.postPurchaseFlow.deliveryInfo, state.postPurchaseFlow.stylingTips]);
  
  const sendWinBackEmail = useCallback(async (email: string) => {
    console.log('💔 WIN-BACK EMAIL:', { email });
    
    console.log('Email data:', {
      to: email,
      template: 'win_back_v1',
      data: {
        exclusiveOffer: state.winBackFlow.exclusiveOffer,
        newArrivals: activeDrops.slice(0, 3)
      }
    });
    
    const conversionEvent = {
      event: 'win_back_email_sent',
      data: { email },
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setConversionEvents(prev => [...prev, conversionEvent]);
    console.log('📊 CONVERSION EVENT:', conversionEvent);
  }, [state.winBackFlow.exclusiveOffer, activeDrops]);
  
  // SMS Automation Functions
  const sendAbandonedCartSMS = useCallback(async (phone: string, cartItems: any[]) => {
    console.log('📱 ABANDONED CART SMS:', { phone, cartItems });
    
    // Simulate Postscript API call
    console.log('SMS data:', {
      to: phone,
      message: `YÈMALÍN: Your exclusive pieces are waiting. Only ${cartItems[0]?.stock || 'few'} left. Complete your order: [link]`,
      urgency: cartItems.some(item => item.stock <= 3)
    });
    
    const conversionEvent = {
      event: 'abandoned_cart_sms_sent',
      data: { phone, cartValue: cartItems.reduce((sum, item) => sum + item.price, 0) },
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setConversionEvents(prev => [...prev, conversionEvent]);
    console.log('📊 CONVERSION EVENT:', conversionEvent);
  }, []);
  
  const sendShippingUpdateSMS = useCallback(async (phone: string, trackingInfo: any) => {
    console.log('🚚 SHIPPING UPDATE SMS:', { phone, trackingInfo });
    
    console.log('SMS data:', {
      to: phone,
      message: `YÈMALÍN: Your exclusive piece is on its way! Track: ${trackingInfo.trackingNumber}`,
      trackingInfo
    });
    
    const conversionEvent = {
      event: 'shipping_update_sms_sent',
      data: { phone },
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setConversionEvents(prev => [...prev, conversionEvent]);
    console.log('📊 CONVERSION EVENT:', conversionEvent);
  }, []);
  
  // Conversion Tracking
  const trackConversion = useCallback((event: string, data: any) => {
    const conversionEvent = {
      event,
      data,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setConversionEvents(prev => [...prev, conversionEvent]);
    console.log('📊 CONVERSION EVENT:', conversionEvent);
  }, []);
  
  const updateVIPStatus = useCallback((userId: string, totalSpent: number) => {
    if (totalSpent >= state.vipSegmentation.spendingThreshold) {
      console.log('👑 VIP STATUS GRANTED:', { userId, totalSpent });
      const conversionEvent = {
        event: 'vip_status_granted',
        data: { userId, totalSpent },
        timestamp: new Date().toISOString(),
        id: Math.random().toString(36).substr(2, 9)
      };
      
      setConversionEvents(prev => [...prev, conversionEvent]);
      console.log('📊 CONVERSION EVENT:', conversionEvent);
    }
  }, [state.vipSegmentation.spendingThreshold]);
  
  // Scarcity Management
  const createScarcityAlert = useCallback((productId: string, stock: number) => {
    if (stock <= state.scarcityMessages.lowStockThreshold) {
      const message = state.scarcityMessages.messages[0].replace('{stock}', stock.toString());
      console.log('⚠️ SCARCITY ALERT:', { productId, stock, message });
      const conversionEvent = {
        event: 'scarcity_alert_triggered',
        data: { productId, stock },
        timestamp: new Date().toISOString(),
        id: Math.random().toString(36).substr(2, 9)
      };
      
      setConversionEvents(prev => [...prev, conversionEvent]);
      console.log('📊 CONVERSION EVENT:', conversionEvent);
    }
  }, [state.scarcityMessages.lowStockThreshold, state.scarcityMessages.messages]);
  
  const triggerDropCountdown = useCallback((dropDate: Date) => {
    const timeUntilDrop = dropDate.getTime() - Date.now();
    console.log('⏰ DROP COUNTDOWN:', { dropDate, timeUntilDrop });
    const conversionEvent = {
      event: 'drop_countdown_started',
      data: { dropDate, timeUntilDrop },
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setConversionEvents(prev => [...prev, conversionEvent]);
    console.log('📊 CONVERSION EVENT:', conversionEvent);
  }, []);
  
  // Luxury Brand Actions
  const addToWaitlist = useCallback(async (email: string, productId?: string) => {
    const newCount = waitlistCount + 1;
    setWaitlistCount(newCount);
    await AsyncStorage.setItem('waitlist_count', newCount.toString());
    
    // Save email
    await emailStorage.saveEmail(email, 'waitlist', {
      productViewed: productId,
    });
    
    console.log('📝 WAITLIST SIGNUP:', { email, productId, position: newCount });
    
    // Send welcome email to waitlist
    await sendWelcomeEmail(email);
    
    const conversionEvent = {
      event: 'waitlist_signup',
      data: { email, productId, position: newCount },
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setConversionEvents(prev => [...prev, conversionEvent]);
    console.log('📊 CONVERSION EVENT:', conversionEvent);
  }, [waitlistCount, sendWelcomeEmail]);
  
  const grantEarlyAccess = useCallback(async (userId: string) => {
    console.log('🔓 EARLY ACCESS GRANTED:', { userId });
    const conversionEvent = {
      event: 'early_access_granted',
      data: { userId },
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setConversionEvents(prev => [...prev, conversionEvent]);
    console.log('📊 CONVERSION EVENT:', conversionEvent);
  }, []);
  
  const createExclusiveDrop = useCallback(async (products: any[], memberOnly: boolean) => {
    const drop = {
      id: Math.random().toString(36).substr(2, 9),
      products,
      memberOnly,
      createdAt: new Date().toISOString(),
      maxPieces: state.luxuryStrategy.maxPiecesPerDrop
    };
    
    setActiveDrops(prev => [...prev, drop]);
    console.log('💎 EXCLUSIVE DROP CREATED:', drop);
    const conversionEvent = {
      event: 'exclusive_drop_created',
      data: drop,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setConversionEvents(prev => [...prev, conversionEvent]);
    console.log('📊 CONVERSION EVENT:', conversionEvent);
  }, [state.luxuryStrategy.maxPiecesPerDrop]);
  
  const actions = useMemo(() => ({
    sendAbandonedCartEmail,
    sendWelcomeEmail,
    sendPostPurchaseEmail,
    sendWinBackEmail,
    sendAbandonedCartSMS,
    sendShippingUpdateSMS,
    trackConversion,
    updateVIPStatus,
    createScarcityAlert,
    triggerDropCountdown,
    addToWaitlist,
    grantEarlyAccess,
    createExclusiveDrop
  }), [sendAbandonedCartEmail, sendWelcomeEmail, sendPostPurchaseEmail, sendWinBackEmail, sendAbandonedCartSMS, sendShippingUpdateSMS, trackConversion, updateVIPStatus, createScarcityAlert, triggerDropCountdown, addToWaitlist, grantEarlyAccess, createExclusiveDrop]);
  
  return useMemo(() => ({
    ...state,
    waitlistCount,
    activeDrops,
    conversionEvents,
    ...actions,
    updateMarketingState: saveMarketingState
  }), [state, waitlistCount, activeDrops, conversionEvents, actions, saveMarketingState]);
});

export type { MarketingState, MarketingActions };