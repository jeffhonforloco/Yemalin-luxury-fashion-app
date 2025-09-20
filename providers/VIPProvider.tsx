import { useState, useEffect, useMemo, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthProvider";

export interface VIPTier {
  name: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
  minSpent: number;
  discountPercent: number;
  freeShipping: boolean;
  earlyAccess: boolean;
  exclusiveEvents: boolean;
  personalStylist: boolean;
  prioritySupport: boolean;
  birthdayGift: boolean;
  color: string;
}

export interface VIPOffer {
  id: string;
  title: string;
  description: string;
  code?: string;
  discountPercent?: number;
  validUntil?: string;
  isAutoApplied: boolean;
  minPurchase?: number;
}

export interface VIPStats {
  totalSpent: number;
  totalSaved: number;
  itemsPurchased: number;
  currentTier: VIPTier;
  nextTier?: VIPTier;
  progressToNextTier: number;
  memberSince: string;
  exclusiveAccessCount: number;
  referralCount: number;
}

interface VIPContextType {
  isVIP: boolean;
  vipStats: VIPStats | null;
  vipOffers: VIPOffer[];
  currentTier: VIPTier | null;
  applyVIPDiscount: (subtotal: number) => number;
  getVIPBenefits: () => string[];
  checkEarlyAccess: (productId: string) => boolean;
  isLoading: boolean;
}

const VIP_TIERS: VIPTier[] = [
  {
    name: "Bronze",
    minSpent: 500,
    discountPercent: 10,
    freeShipping: true,
    earlyAccess: false,
    exclusiveEvents: false,
    personalStylist: false,
    prioritySupport: false,
    birthdayGift: false,
    color: "#CD7F32",
  },
  {
    name: "Silver",
    minSpent: 1000,
    discountPercent: 15,
    freeShipping: true,
    earlyAccess: true,
    exclusiveEvents: false,
    personalStylist: false,
    prioritySupport: true,
    birthdayGift: false,
    color: "#C0C0C0",
  },
  {
    name: "Gold",
    minSpent: 2500,
    discountPercent: 20,
    freeShipping: true,
    earlyAccess: true,
    exclusiveEvents: true,
    personalStylist: false,
    prioritySupport: true,
    birthdayGift: true,
    color: "#FFD700",
  },
  {
    name: "Platinum",
    minSpent: 5000,
    discountPercent: 25,
    freeShipping: true,
    earlyAccess: true,
    exclusiveEvents: true,
    personalStylist: true,
    prioritySupport: true,
    birthdayGift: true,
    color: "#E5E4E2",
  },
  {
    name: "Diamond",
    minSpent: 10000,
    discountPercent: 30,
    freeShipping: true,
    earlyAccess: true,
    exclusiveEvents: true,
    personalStylist: true,
    prioritySupport: true,
    birthdayGift: true,
    color: "#B9F2FF",
  },
];

export const [VIPProvider, useVIP] = createContextHook<VIPContextType>(() => {
  const { user, isVIP: isUserVIP } = useAuth();
  const [vipStats, setVipStats] = useState<VIPStats | null>(null);
  const [vipOffers, setVipOffers] = useState<VIPOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentTier = useMemo(() => {
    if (!user) return null;
    
    const sortedTiers = [...VIP_TIERS].sort((a, b) => b.minSpent - a.minSpent);
    return sortedTiers.find(tier => user.totalSpent >= tier.minSpent) || null;
  }, [user]);

  const nextTier = useMemo(() => {
    if (!user || !currentTier) return VIP_TIERS[0];
    
    const currentIndex = VIP_TIERS.findIndex(t => t.name === currentTier.name);
    if (currentIndex < VIP_TIERS.length - 1) {
      return VIP_TIERS[currentIndex + 1];
    }
    return undefined;
  }, [currentTier, user]);

  useEffect(() => {
    loadVIPData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user && currentTier) {
      generateVIPOffers();
      updateVIPStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentTier]);

  const loadVIPData = async () => {
    try {
      setIsLoading(true);
      if (user && isUserVIP) {
        const savedStats = await AsyncStorage.getItem(`@vip_stats_${user.id}`);
        if (savedStats) {
          setVipStats(JSON.parse(savedStats));
        } else {
          updateVIPStats();
        }
      }
    } catch (error) {
      console.error("Error loading VIP data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateVIPStats = async () => {
    if (!user || !currentTier) return;

    const stats: VIPStats = {
      totalSpent: user.totalSpent,
      totalSaved: Math.floor(user.totalSpent * 0.3), // Estimate 30% saved through VIP
      itemsPurchased: Math.floor(user.totalSpent / 250), // Estimate average item price
      currentTier,
      nextTier,
      progressToNextTier: nextTier 
        ? ((user.totalSpent - currentTier.minSpent) / (nextTier.minSpent - currentTier.minSpent)) * 100
        : 100,
      memberSince: user.memberSince,
      exclusiveAccessCount: Math.floor(user.totalSpent / 500), // Estimate exclusive access count
      referralCount: Math.floor(Math.random() * 5), // Mock referral count
    };

    setVipStats(stats);
    await AsyncStorage.setItem(`@vip_stats_${user.id}`, JSON.stringify(stats));
  };

  const generateVIPOffers = () => {
    if (!currentTier) return;

    const offers: VIPOffer[] = [
      {
        id: "vip_discount",
        title: `${currentTier.discountPercent}% OFF`,
        description: `Your ${currentTier.name} tier exclusive discount`,
        code: `VIP${currentTier.name.toUpperCase()}`,
        discountPercent: currentTier.discountPercent,
        isAutoApplied: true,
      },
    ];

    if (currentTier.freeShipping) {
      offers.push({
        id: "free_shipping",
        title: "FREE SHIPPING",
        description: "On all orders, no minimum",
        isAutoApplied: true,
      });
    }

    if (currentTier.earlyAccess) {
      offers.push({
        id: "early_access",
        title: "EARLY ACCESS",
        description: "Shop new collections 48 hours early",
        isAutoApplied: true,
      });
    }

    if (currentTier.exclusiveEvents) {
      offers.push({
        id: "exclusive_events",
        title: "EXCLUSIVE EVENTS",
        description: "Invitations to VIP-only fashion shows",
        isAutoApplied: false,
      });
    }

    if (currentTier.personalStylist) {
      offers.push({
        id: "personal_stylist",
        title: "PERSONAL STYLIST",
        description: "Complimentary styling consultations",
        isAutoApplied: false,
      });
    }

    // Add seasonal offers
    const month = new Date().getMonth();
    if (month === 11 || month === 0) { // December or January
      offers.push({
        id: "seasonal_bonus",
        title: "SEASONAL BONUS",
        description: "Extra 10% off winter collection",
        code: "WINTER10",
        discountPercent: 10,
        validUntil: "2025-02-01",
        isAutoApplied: false,
      });
    }

    setVipOffers(offers);
  };

  const applyVIPDiscount = useCallback((subtotal: number): number => {
    if (!currentTier) return subtotal;
    
    const discount = subtotal * (currentTier.discountPercent / 100);
    return subtotal - discount;
  }, [currentTier]);

  const getVIPBenefits = useCallback((): string[] => {
    if (!currentTier) return [];

    const benefits: string[] = [
      `${currentTier.discountPercent}% discount on all items`,
    ];

    if (currentTier.freeShipping) benefits.push("Free shipping on all orders");
    if (currentTier.earlyAccess) benefits.push("48-hour early access to new collections");
    if (currentTier.exclusiveEvents) benefits.push("Exclusive event invitations");
    if (currentTier.personalStylist) benefits.push("Personal stylist consultations");
    if (currentTier.prioritySupport) benefits.push("Priority customer support");
    if (currentTier.birthdayGift) benefits.push("Annual birthday gift");

    return benefits;
  }, [currentTier]);

  const checkEarlyAccess = useCallback((productId: string): boolean => {
    if (!currentTier) return false;
    return currentTier.earlyAccess;
  }, [currentTier]);

  return useMemo(() => ({
    isVIP: isUserVIP,
    vipStats,
    vipOffers,
    currentTier,
    applyVIPDiscount,
    getVIPBenefits,
    checkEarlyAccess,
    isLoading,
  }), [isUserVIP, vipStats, vipOffers, currentTier, applyVIPDiscount, getVIPBenefits, checkEarlyAccess, isLoading]);
});