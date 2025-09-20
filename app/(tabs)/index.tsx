import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowRight, Clock, Users, Star, Mail, Bell, Crown, Zap, Calendar, Lock } from "lucide-react-native";
import { products, comingSoonProducts } from "@/data/products";
import { useMarketing } from "@/providers/MarketingProvider";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [email, setEmail] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(72 * 60 * 60); // 72 hours in seconds
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [showFirstOrderPopup, setShowFirstOrderPopup] = useState<boolean>(false);
  
  const marketing = useMarketing();
  const featuredProducts = useMemo(() => products.filter(p => p.stock <= 5).slice(0, 3), []);
  const soldOutProducts = useMemo(() => products.filter(p => p.stock === 0), []);
  const waitlistCount = marketing.waitlistCount;
  const hasTriggeredAlerts = useRef(false);
  
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    
    // First order discount popup (Supreme strategy)
    if (marketing.firstOrderDiscount.enabled) {
      const popupTimer = setTimeout(() => {
        setShowFirstOrderPopup(true);
        marketing.trackConversion('first_order_popup_shown', { timing: marketing.firstOrderDiscount.popupTiming });
      }, marketing.firstOrderDiscount.popupTiming * 1000);
      
      return () => {
        clearInterval(timer);
        clearTimeout(popupTimer);
      };
    }
    
    return () => clearInterval(timer);
  }, []);
  
  // Handle scarcity alerts only once on mount
  useEffect(() => {
    if (!hasTriggeredAlerts.current && marketing.scarcityMessages.enabled) {
      featuredProducts.forEach((product) => {
        if (product.stock <= marketing.scarcityMessages.lowStockThreshold) {
          marketing.createScarcityAlert(product.id, product.stock);
        }
      });
      hasTriggeredAlerts.current = true;
    }
  }, []); // Empty dependency array - only run once on mount
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleWaitlistSignup = async () => {
    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    try {
      await marketing.addToWaitlist(email);
      Alert.alert(
        'Welcome to the Elite Circle',
        `Welcome to the elite circle! You're now member #${marketing.waitlistCount}. You'll receive 48-hour early access to all drops and exclusive member pricing.`,
        [{ text: 'Perfect', style: 'default' }]
      );
      setEmail('');
      
      // Track conversion
      marketing.trackConversion('homepage_waitlist_signup', { email, source: 'homepage' });
    } catch (error) {
      Alert.alert('Error', 'Failed to join waitlist. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Exclusive Access Banner */}
        <Animated.View style={[styles.exclusiveBanner, { opacity: fadeAnim }]}>
          <Crown color="#FFD700" size={16} />
          <Text style={styles.exclusiveText}>EXCLUSIVE PRE-LAUNCH ACCESS</Text>
          <Crown color="#FFD700" size={16} />
        </Animated.View>
        
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>YÈMALÍN</Text>
            <View style={styles.logoAccents}>
              <View style={styles.logoLine} />
              <Text style={styles.logoSubtext}>ULTRA-EXCLUSIVE</Text>
              <View style={styles.logoLine} />
            </View>
          </View>
          <Text style={styles.tagline}>Where Luxury Meets Scarcity</Text>
          <View style={styles.waitlistStats}>
            <Users color="#666" size={14} />
            <Text style={styles.waitlistText}>{waitlistCount.toLocaleString()} elite members</Text>
          </View>
          <View style={styles.exclusivityBadge}>
            <Crown color="#FFD700" size={12} />
            <Text style={styles.exclusivityText}>INVITATION ONLY</Text>
          </View>
        </Animated.View>

        {/* Countdown Timer */}
        <View style={styles.countdownSection}>
          <View style={styles.dropAlert}>
            <Zap color="#FFD700" size={16} />
            <Text style={styles.dropAlertText}>EXCLUSIVE DROP ALERT</Text>
            <Zap color="#FFD700" size={16} />
          </View>
          <Text style={styles.countdownTitle}>NEXT RELEASE IN</Text>
          <View style={styles.countdownTimer}>
            <Clock color="#d32f2f" size={20} />
            <Text style={styles.countdownText}>{formatTime(countdown)}</Text>
          </View>
          <Text style={styles.countdownSubtext}>Only 50 pieces worldwide • VIP early access in 24h</Text>
          <View style={styles.scarcityIndicators}>
            <View style={styles.scarcityItem}>
              <Text style={styles.scarcityNumber}>50</Text>
              <Text style={styles.scarcityLabel}>PIECES ONLY</Text>
            </View>
            <View style={styles.scarcityDivider} />
            <View style={styles.scarcityItem}>
              <Text style={styles.scarcityNumber}>3,247</Text>
              <Text style={styles.scarcityLabel}>ELITE MEMBERS</Text>
            </View>
            <View style={styles.scarcityDivider} />
            <View style={styles.scarcityItem}>
              <Text style={styles.scarcityNumber}>4 MIN</Text>
              <Text style={styles.scarcityLabel}>LAST SELLOUT</Text>
            </View>
          </View>
        </View>
        
        {/* Hero Section */}
        <TouchableOpacity
          style={styles.hero}
          onPress={() => router.push("/shop")}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/fpcgn4ya0mdubfxwc2qfo" }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <View style={styles.urgencyBadge}>
              <Zap color="#FFD700" size={16} />
              <Text style={styles.urgencyText}>ALMOST SOLD OUT</Text>
            </View>
            <Text style={styles.heroTitle}>FINAL PIECES</Text>
            <Text style={styles.heroSubtitle}>Last chance before restock</Text>
            <View style={styles.shopNowButton}>
              <Text style={styles.shopNowText}>SECURE YOURS</Text>
              <ArrowRight color="#fff" size={20} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Critical Stock Alert */}
        <View style={styles.criticalSection}>
          <View style={styles.criticalHeader}>
            <Bell color="#d32f2f" size={20} />
            <Text style={styles.criticalTitle}>CRITICAL STOCK ALERT</Text>
          </View>
          <Text style={styles.criticalSubtext}>These pieces are flying off our shelves</Text>
          
          <View style={styles.productsGrid}>
            {featuredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.criticalProductCard}
                onPress={() => {
                  marketing.trackConversion('product_view_from_homepage', { productId: product.id, stock: product.stock });
                  router.push(`/product/${product.id}`);
                }}
                activeOpacity={0.9}
              >
                <View style={styles.stockBadge}>
                  <Text style={styles.stockBadgeText}>{product.stock} LEFT</Text>
                </View>
                <Image source={{ uri: product.image }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>${product.price}</Text>
                  <View style={styles.urgencyIndicator}>
                    <View style={[styles.urgencyDot, { backgroundColor: product.stock <= 2 ? '#d32f2f' : '#ff9800' }]} />
                    <Text style={styles.urgencyLabel}>
                      {product.stock <= 2 ? 'FINAL PIECES' : 'LOW STOCK'}
                    </Text>
                  </View>
                  {marketing.scarcityMessages.enabled && product.stock <= marketing.scarcityMessages.lowStockThreshold && (
                    <Text style={styles.scarcityMessage}>
                      {marketing.scarcityMessages.messages[0].replace('{stock}', product.stock.toString())}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Sold Out Hall of Fame */}
        {soldOutProducts.length > 0 && (
          <View style={styles.soldOutSection}>
            <Text style={styles.soldOutTitle}>SOLD OUT IN MINUTES</Text>
            <Text style={styles.soldOutSubtext}>Join the waitlist to be notified when these return</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.soldOutScroll}>
              {soldOutProducts.map((product) => (
                <View key={product.id} style={styles.soldOutCard}>
                  <Image source={{ uri: product.image }} style={styles.soldOutImage} />
                  <View style={styles.soldOutOverlay}>
                    <Text style={styles.soldOutText}>SOLD OUT</Text>
                  </View>
                  <Text style={styles.soldOutName}>{product.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Coming Soon - Build Anticipation */}
        <View style={styles.comingSoonSection}>
          <View style={styles.comingSoonHeader}>
            <Lock color="#FFD700" size={20} />
            <Text style={styles.comingSoonTitle}>COMING SOON</Text>
            <Lock color="#FFD700" size={20} />
          </View>
          <Text style={styles.comingSoonSubtext}>Next-level luxury pieces in development</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.comingSoonScroll}>
            {comingSoonProducts.map((product) => {
              const releaseDate = new Date(product.releaseDate);
              const daysUntilRelease = Math.ceil((releaseDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              
              return (
                <View key={product.id} style={styles.comingSoonCard}>
                  <Image source={{ uri: product.image }} style={styles.comingSoonImage} />
                  <View style={styles.comingSoonOverlay}>
                    {product.exclusiveAccess && (
                      <View style={styles.exclusiveBadge}>
                        <Crown color="#FFD700" size={12} />
                        <Text style={styles.exclusiveBadgeText}>VIP ONLY</Text>
                      </View>
                    )}
                    <View style={styles.releaseInfo}>
                      <Calendar color="#fff" size={16} />
                      <Text style={styles.releaseText}>{daysUntilRelease} DAYS</Text>
                    </View>
                  </View>
                  <View style={styles.comingSoonInfo}>
                    <Text style={styles.comingSoonName}>{product.name}</Text>
                    <Text style={styles.comingSoonPrice}>${product.price}</Text>
                    <View style={styles.waitlistInfo}>
                      <Users color="#666" size={14} />
                      <Text style={styles.waitlistCount}>{product.waitlistCount} waiting</Text>
                    </View>
                    <View style={styles.limitedTextContainer}>
                      <Text style={styles.limitedText}>Only {product.totalMade} will be made</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
        
        {/* Brand Story */}
        <View style={styles.brandStory}>
          <Text style={styles.storyTitle}>CRAFTED WITH PURPOSE</Text>
          <Text style={styles.storyText}>
            Each piece is meticulously designed to embody timeless elegance. 
            Premium materials meet exceptional craftsmanship.
          </Text>
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.learnMoreText}>LEARN MORE</Text>
          </TouchableOpacity>
        </View>

        {/* Elite Access Section */}
        <View style={styles.eliteSection}>
          <View style={styles.eliteHeader}>
            <Crown color="#FFD700" size={28} />
            <Text style={styles.eliteTitle}>THE INNER CIRCLE</Text>
            <Crown color="#FFD700" size={28} />
          </View>
          <Text style={styles.eliteSubtext}>
            By invitation only. Join the most exclusive fashion community.
          </Text>
          
          <View style={styles.exclusiveStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>&lt; 1%</Text>
              <Text style={styles.statLabel}>ACCEPTANCE RATE</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>48H</Text>
              <Text style={styles.statLabel}>EARLY ACCESS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>30%</Text>
              <Text style={styles.statLabel}>MEMBER DISCOUNT</Text>
            </View>
          </View>
          
          <View style={styles.eliteBenefits}>
            <View style={styles.benefit}>
              <Lock color="#FFD700" size={16} />
              <Text style={styles.benefitText}>Exclusive pre-launch access</Text>
            </View>
            <View style={styles.benefit}>
              <Star color="#FFD700" size={16} />
              <Text style={styles.benefitText}>Member-only collections</Text>
            </View>
            <View style={styles.benefit}>
              <Crown color="#FFD700" size={16} />
              <Text style={styles.benefitText}>Personal styling consultation</Text>
            </View>
            <View style={styles.benefit}>
              <Zap color="#FFD700" size={16} />
              <Text style={styles.benefitText}>Priority customer service</Text>
            </View>
          </View>
          
          <View style={styles.applicationForm}>
            <Text style={styles.applicationTitle}>APPLICATION FOR MEMBERSHIP</Text>
            <View style={styles.emailInput}>
              <Mail color="#666" size={20} />
              <TextInput
                style={styles.emailField}
                placeholder="Email address (required)"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <TouchableOpacity style={styles.applyButton} onPress={handleWaitlistSignup}>
              <Text style={styles.applyButtonText}>SUBMIT APPLICATION</Text>
              <ArrowRight color="#000" size={16} />
            </TouchableOpacity>
            
            <Text style={styles.applicationNote}>
              Elite applications reviewed within 24 hours • Member #{waitlistCount + 1}
            </Text>
          </View>
        </View>
        
        {/* First Order Discount Popup */}
        {showFirstOrderPopup && (
          <View style={styles.popupOverlay}>
            <Animated.View style={[styles.popupContainer, { opacity: fadeAnim }]}>
              <TouchableOpacity 
                style={styles.popupClose}
                onPress={() => {
                  setShowFirstOrderPopup(false);
                  marketing.trackConversion('first_order_popup_closed', { action: 'close' });
                }}
              >
                <Text style={styles.popupCloseText}>×</Text>
              </TouchableOpacity>
              
              <Crown color="#FFD700" size={40} />
              <Text style={styles.popupTitle}>EXCLUSIVE FIRST ORDER</Text>
              <Text style={styles.popupSubtitle}>Welcome to YÈMALÍN</Text>
              <Text style={styles.popupDiscount}>{marketing.firstOrderDiscount.percentage}% OFF</Text>
              <Text style={styles.popupDescription}>
                Join the elite circle and save on your first luxury piece
              </Text>
              
              <TouchableOpacity 
                style={styles.popupButton}
                onPress={() => {
                  setShowFirstOrderPopup(false);
                  marketing.trackConversion('first_order_popup_claimed', { discount: marketing.firstOrderDiscount.percentage });
                  router.push('/shop');
                }}
              >
                <Text style={styles.popupButtonText}>CLAIM DISCOUNT</Text>
                <ArrowRight color="#000" size={16} />
              </TouchableOpacity>
              
              <Text style={styles.popupNote}>Limited time • New customers only</Text>
            </Animated.View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  exclusiveBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    paddingVertical: 8,
    gap: 8,
  },
  exclusiveText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  waitlistStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  waitlistText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500" as const,
  },
  logo: {
    fontSize: 28,
    fontWeight: "300" as const,
    letterSpacing: 4,
    color: "#000",
  },
  tagline: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    letterSpacing: 1,
  },
  countdownSection: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fafafa",
    borderBottomWidth: 2,
    borderBottomColor: "#d32f2f",
  },
  countdownTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 1,
    color: "#333",
    marginBottom: 8,
  },
  countdownTimer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  countdownText: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#d32f2f",
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  countdownSubtext: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  hero: {
    position: "relative",
    height: 600,
    backgroundColor: "#f5f5f5",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    backgroundColor: "#f5f5f5",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 30,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
    gap: 6,
  },
  urgencyText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "300" as const,
    color: "#fff",
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 20,
  },
  shopNowButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shopNowText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 1,
  },
  criticalSection: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 3,
    borderTopColor: "#d32f2f",
  },
  criticalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  criticalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#d32f2f",
    letterSpacing: 1,
  },
  criticalSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "300" as const,
    letterSpacing: 2,
    marginBottom: 20,
    textAlign: "center",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Platform.OS === 'web' ? 16 : 0,
    ...(Platform.OS === 'web' && {
      maxWidth: 1000,
      alignSelf: 'center',
      width: '100%',
      paddingHorizontal: 20,
    }),
  },
  criticalProductCard: {
    width: Platform.OS === 'web' ? '48%' as const : (width - 50) / 2,
    marginBottom: 20,
    position: "relative",
    borderWidth: 2,
    borderColor: "#d32f2f",
    borderRadius: 8,
    overflow: "hidden",
    ...(Platform.OS === 'web' && {
      minWidth: 280,
      maxWidth: 380,
      flex: 1,
    }),
  },
  stockBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#d32f2f",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  stockBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
  },
  productImage: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
    ...(Platform.OS === 'web' ? {
      aspectRatio: 4/3,
      resizeMode: 'contain' as const,
      objectFit: 'contain' as const,
    } : {
      height: 250,
      resizeMode: 'cover' as const,
    }),
  },
  productInfo: {
    gap: 4,
    padding: 12,
  },
  urgencyIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  urgencyLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#d32f2f",
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500" as const,
    letterSpacing: 0.5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "300" as const,
  },
  soldOutSection: {
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  soldOutTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1,
  },
  soldOutSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  soldOutScroll: {
    marginHorizontal: -20,
  },
  soldOutCard: {
    width: 120,
    marginLeft: 20,
    position: "relative",
  },
  soldOutImage: {
    width: 120,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    ...(Platform.OS === 'web' ? {
      aspectRatio: 3/4,
      resizeMode: 'contain' as const,
      objectFit: 'contain' as const,
    } : {
      height: 150,
      resizeMode: 'cover' as const,
    }),
  },
  soldOutOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  soldOutText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700" as const,
    letterSpacing: 1,
  },
  soldOutName: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    color: "#666",
  },
  brandStory: {
    backgroundColor: "#fafafa",
    padding: 40,
    alignItems: "center",
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: "300" as const,
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: "center",
  },
  storyText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 300,
  },
  learnMoreButton: {
    borderWidth: 1,
    borderColor: "#000",
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  learnMoreText: {
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 1,
  },
  vipSection: {
    padding: 30,
    backgroundColor: "#000",
    alignItems: "center",
  },
  vipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  vipTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFD700",
    letterSpacing: 2,
  },
  vipSubtext: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  vipBenefits: {
    gap: 12,
    marginBottom: 30,
    alignSelf: "stretch",
  },
  benefit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500" as const,
  },
  emailInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    alignSelf: "stretch",
    gap: 12,
  },
  emailField: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  vipButton: {
    backgroundColor: "#FFD700",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  vipButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700" as const,
    letterSpacing: 1,
  },
  waitlistPosition: {
    color: "#999",
    fontSize: 12,
    fontStyle: "italic",
  },
  comingSoonSection: {
    padding: 20,
    backgroundColor: "#1a1a1a",
  },
  comingSoonHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 8,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFD700",
    letterSpacing: 2,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  comingSoonScroll: {
    marginHorizontal: -20,
  },
  comingSoonCard: {
    width: 180,
    marginLeft: 20,
    position: "relative",
  },
  comingSoonImage: {
    width: 180,
    backgroundColor: "#333",
    borderRadius: 12,
    ...(Platform.OS === 'web' ? {
      aspectRatio: 9/11,
      resizeMode: 'contain' as const,
      objectFit: 'contain' as const,
    } : {
      height: 220,
      resizeMode: 'cover' as const,
    }),
  },
  comingSoonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 12,
    justifyContent: "space-between",
  },
  exclusiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 4,
  },
  exclusiveBadgeText: {
    color: "#FFD700",
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
  },
  releaseInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "center",
    gap: 6,
  },
  releaseText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 1,
  },
  comingSoonInfo: {
    marginTop: 12,
    gap: 4,
  },
  comingSoonName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
    letterSpacing: 0.5,
  },
  comingSoonPrice: {
    fontSize: 16,
    fontWeight: "300" as const,
    color: "#FFD700",
  },
  waitlistInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  waitlistCount: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500" as const,
  },
  limitedTextContainer: {
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  limitedText: {
    fontSize: 11,
    color: "#d32f2f",
    fontStyle: "italic",
    fontWeight: "600" as const,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  logoAccents: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  logoLine: {
    width: 20,
    height: 1,
    backgroundColor: "#ccc",
  },
  logoSubtext: {
    fontSize: 10,
    color: "#999",
    letterSpacing: 2,
    fontWeight: "300" as const,
  },
  exclusivityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  exclusivityText: {
    color: "#FFD700",
    fontSize: 10,
    fontWeight: "600" as const,
    letterSpacing: 1,
  },
  dropAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  dropAlertText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: 1,
  },
  scarcityIndicators: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 20,
  },
  scarcityItem: {
    alignItems: "center",
    gap: 4,
  },
  scarcityNumber: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#d32f2f",
    letterSpacing: 1,
  },
  scarcityLabel: {
    fontSize: 10,
    color: "#666",
    fontWeight: "600" as const,
    letterSpacing: 0.5,
  },
  scarcityDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#ddd",
  },
  eliteSection: {
    padding: 30,
    backgroundColor: "#000",
    alignItems: "center",
  },
  eliteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  eliteTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#FFD700",
    letterSpacing: 2,
  },
  eliteSubtext: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
    fontStyle: "italic",
  },
  exclusiveStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    gap: 20,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFD700",
    letterSpacing: 1,
  },
  statLabel: {
    fontSize: 10,
    color: "#999",
    fontWeight: "600" as const,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#333",
  },
  eliteBenefits: {
    gap: 16,
    marginBottom: 30,
    alignSelf: "stretch",
  },
  applicationForm: {
    alignSelf: "stretch",
    alignItems: "center",
  },
  applicationTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFD700",
    letterSpacing: 1,
    marginBottom: 20,
    textAlign: "center",
  },
  applyButton: {
    backgroundColor: "#FFD700",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  applyButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700" as const,
    letterSpacing: 1,
  },
  applicationNote: {
    color: "#999",
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 16,
  },
  scarcityMessage: {
    fontSize: 10,
    color: "#d32f2f",
    fontWeight: "600" as const,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  popupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  popupContainer: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    maxWidth: 350,
    position: "relative",
  },
  popupClose: {
    position: "absolute",
    top: 15,
    right: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  popupCloseText: {
    fontSize: 24,
    color: "#999",
    fontWeight: "300" as const,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    letterSpacing: 2,
    marginTop: 20,
    marginBottom: 4,
  },
  popupSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  popupDiscount: {
    fontSize: 48,
    fontWeight: "300" as const,
    color: "#d32f2f",
    letterSpacing: 2,
    marginBottom: 8,
  },
  popupDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  popupButton: {
    backgroundColor: "#FFD700",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  popupButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700" as const,
    letterSpacing: 1,
  },
  popupNote: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
  },
});