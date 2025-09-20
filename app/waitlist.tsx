import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Check, Star, Package } from "lucide-react-native";
import { useAuth } from "@/providers/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface WaitlistItem {
  id: string;
  name: string;
  description: string;
  estimatedDate: string;
  image: string;
  notifyEnabled: boolean;
}

export default function WaitlistScreen() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [waitlistItems, setWaitlistItems] = useState<WaitlistItem[]>([
    {
      id: "1",
      name: "YÈMALÍN LUXURY BAG",
      description: "Exclusive handcrafted luxury bag with premium leather and signature YÈMALÍN detailing",
      estimatedDate: "Coming Soon",
      image: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/4q5h5ldw3gy7ukppngwda",
      notifyEnabled: false,
    },
    {
      id: "2",
      name: "YÈMALÍN HOMME JEANS",
      description: "Premium men's denim crafted with the finest materials and impeccable tailoring",
      estimatedDate: "Coming Soon",
      image: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/lzwbpkj9a3twfevcto3b9",
      notifyEnabled: false,
    },
    {
      id: "3",
      name: "YÈMALÍN FEMME JEANS",
      description: "Luxury women's denim with perfect fit and sophisticated design details",
      estimatedDate: "Coming Soon",
      image: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/e0tjresqz6thjkz4793zw",
      notifyEnabled: false,
    },
  ]);
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);

  const handleJoinWaitlist = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // Save to AsyncStorage
    await AsyncStorage.setItem("@yemalin_waitlist_email", email);
    setJoinedWaitlist(true);
    
    Alert.alert(
      "Welcome to the Waitlist!",
      "You'll be the first to know when new collections drop.",
      [{ text: "OK" }]
    );
  };

  const toggleNotification = (id: string) => {
    setWaitlistItems(items =>
      items.map(item =>
        item.id === id ? { ...item, notifyEnabled: !item.notifyEnabled } : item
      )
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>EXCLUSIVE WAITLIST</Text>
            <Text style={styles.subtitle}>Be first to access upcoming collections</Text>
          </View>

          {/* Join Waitlist Section */}
          {!joinedWaitlist ? (
            <View style={styles.joinSection}>
              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>WAITLIST BENEFITS</Text>
                <View style={styles.benefit}>
                  <Star size={16} color="#FFD700" />
                  <Text style={styles.benefitText}>Early access to new collections</Text>
                </View>
                <View style={styles.benefit}>
                  <Package size={16} color="#FFD700" />
                  <Text style={styles.benefitText}>Exclusive pre-order opportunities</Text>
                </View>
                <View style={styles.benefit}>
                  <Bell size={16} color="#FFD700" />
                  <Text style={styles.benefitText}>Priority notifications for restocks</Text>
                </View>
              </View>

              <View style={styles.emailSection}>
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.joinButton} onPress={handleJoinWaitlist}>
                  <Text style={styles.joinButtonText}>JOIN WAITLIST</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.successMessage}>
              <View style={styles.successIcon}>
                <Check size={24} color="#4CAF50" />
              </View>
              <Text style={styles.successTitle}>You're on the list!</Text>
              <Text style={styles.successText}>
                We'll notify you at {email} when new items become available.
              </Text>
            </View>
          )}

          {/* Upcoming Collections */}
          <View style={styles.collectionsSection}>
            <Text style={styles.sectionTitle}>UPCOMING COLLECTIONS</Text>
            {waitlistItems.map((item) => (
              <View key={item.id} style={styles.collectionItem}>
                <Image source={{ uri: item.image }} style={styles.collectionImage} />
                <View style={styles.collectionInfo}>
                  <Text style={styles.collectionName}>{item.name}</Text>
                  <Text style={styles.collectionDescription}>{item.description}</Text>
                  <Text style={styles.collectionDate}>{item.estimatedDate}</Text>
                  <TouchableOpacity
                    style={styles.notifyButton}
                    onPress={() => toggleNotification(item.id)}
                  >
                    <Bell
                      size={16}
                      color={item.notifyEnabled ? "#000" : "#999"}
                      fill={item.notifyEnabled ? "#000" : "transparent"}
                    />
                    <Text style={[
                      styles.notifyButtonText,
                      item.notifyEnabled && styles.notifyButtonTextActive
                    ]}>
                      {item.notifyEnabled ? "Notifications On" : "Notify Me"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* VIP Priority */}
          <View style={styles.vipSection}>
            <View style={styles.vipCard}>
              <Star size={24} color="#FFD700" />
              <Text style={styles.vipTitle}>VIP PRIORITY ACCESS</Text>
              <Text style={styles.vipText}>
                VIP members get 24-hour early access to all new collections and exclusive colorways.
              </Text>
              <TouchableOpacity style={styles.vipButton}>
                <Text style={styles.vipButtonText}>LEARN MORE ABOUT VIP</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>15,000+</Text>
              <Text style={styles.statLabel}>Members on waitlist</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>48hrs</Text>
              <Text style={styles.statLabel}>Early access window</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>90%</Text>
              <Text style={styles.statLabel}>Sell-out rate</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 30,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "300" as const,
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  joinSection: {
    padding: 30,
  },
  benefitsContainer: {
    marginBottom: 30,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 1,
    marginBottom: 20,
  },
  benefit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: "#333",
  },
  emailSection: {
    gap: 16,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    backgroundColor: "#fafafa",
  },
  joinButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    alignItems: "center",
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 1,
  },
  successMessage: {
    padding: 30,
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 8,
  },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "500" as const,
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  collectionsSection: {
    padding: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 1,
    marginBottom: 20,
  },
  collectionItem: {
    flexDirection: "row",
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  collectionImage: {
    width: 100,
    height: 120,
    backgroundColor: "#f5f5f5",
    marginRight: 16,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 14,
    fontWeight: "500" as const,
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  collectionDate: {
    fontSize: 11,
    color: "#999",
    marginBottom: 12,
  },
  notifyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  notifyButtonText: {
    fontSize: 12,
    color: "#999",
  },
  notifyButtonTextActive: {
    color: "#000",
    fontWeight: "500" as const,
  },
  vipSection: {
    padding: 30,
    backgroundColor: "#fafafa",
  },
  vipCard: {
    backgroundColor: "#fff",
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  vipTitle: {
    fontSize: 16,
    fontWeight: "500" as const,
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 8,
  },
  vipText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  vipButton: {
    borderWidth: 1,
    borderColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  vipButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 0.5,
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 30,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
});