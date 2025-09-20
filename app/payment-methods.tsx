import React, { useState, useEffect } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CreditCard, Plus, Trash2, Check, Shield } from "lucide-react-native";
import { useAuth } from "@/providers/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard" | "amex" | "discover";
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  cardholderName: string;
}

export default function PaymentMethodsScreen() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const stored = await AsyncStorage.getItem("@yemalin_payment_methods");
      if (stored) {
        setPaymentMethods(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePaymentMethods = async (methods: PaymentMethod[]) => {
    try {
      await AsyncStorage.setItem("@yemalin_payment_methods", JSON.stringify(methods));
    } catch (error) {
      console.error("Error saving payment methods:", error);
    }
  };

  const detectCardType = (number: string): PaymentMethod["type"] => {
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.startsWith("4")) return "visa";
    if (cleaned.startsWith("5")) return "mastercard";
    if (cleaned.startsWith("3")) return "amex";
    return "discover";
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(" ").substr(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleAddCard = () => {
    if (!newCard.number || !newCard.expiry || !newCard.cvv || !newCard.name) {
      Alert.alert("Error", "Please fill in all card details");
      return;
    }

    const [month, year] = newCard.expiry.split("/");
    const cardNumber = newCard.number.replace(/\s/g, "");
    
    if (cardNumber.length < 15) {
      Alert.alert("Error", "Invalid card number");
      return;
    }

    const newPaymentMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: detectCardType(cardNumber),
      last4: cardNumber.slice(-4),
      expiryMonth: month,
      expiryYear: "20" + year,
      isDefault: paymentMethods.length === 0,
      cardholderName: newCard.name,
    };

    const updatedMethods = [...paymentMethods, newPaymentMethod];
    setPaymentMethods(updatedMethods);
    savePaymentMethods(updatedMethods);
    
    setNewCard({ number: "", expiry: "", cvv: "", name: "", zipCode: "" });
    setShowAddCard(false);
    
    Alert.alert("Success", "Payment method added successfully");
  };

  const handleSetDefault = (id: string) => {
    const updatedMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id,
    }));
    setPaymentMethods(updatedMethods);
    savePaymentMethods(updatedMethods);
  };

  const handleDeleteCard = (id: string) => {
    Alert.alert(
      "Remove Card",
      "Are you sure you want to remove this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            const updatedMethods = paymentMethods.filter(method => method.id !== id);
            // If we deleted the default, make the first one default
            if (updatedMethods.length > 0 && !updatedMethods.some(m => m.isDefault)) {
              updatedMethods[0].isDefault = true;
            }
            setPaymentMethods(updatedMethods);
            savePaymentMethods(updatedMethods);
          },
        },
      ]
    );
  };

  const getCardIcon = (type: PaymentMethod["type"]) => {
    const icons = {
      visa: "VISA",
      mastercard: "MC",
      amex: "AMEX",
      discover: "DISC",
    };
    return icons[type];
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
            <Text style={styles.title}>PAYMENT METHODS</Text>
            <Text style={styles.subtitle}>Manage your payment options</Text>
          </View>

          {/* Security Badge */}
          <View style={styles.securityBadge}>
            <Shield size={16} color="#4CAF50" />
            <Text style={styles.securityText}>
              Your payment information is encrypted and secure
            </Text>
          </View>

          {/* Saved Cards */}
          {paymentMethods.length > 0 && (
            <View style={styles.cardsSection}>
              <Text style={styles.sectionTitle}>SAVED CARDS</Text>
              {paymentMethods.map((method) => (
                <View key={method.id} style={styles.cardItem}>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardType}>
                        <Text style={styles.cardTypeText}>{getCardIcon(method.type)}</Text>
                      </View>
                      <Text style={styles.cardNumber}>•••• {method.last4}</Text>
                      {method.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultText}>DEFAULT</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardName}>{method.cardholderName}</Text>
                    <Text style={styles.cardExpiry}>
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </Text>
                  </View>
                  <View style={styles.cardActions}>
                    {!method.isDefault && (
                      <TouchableOpacity
                        style={styles.setDefaultButton}
                        onPress={() => handleSetDefault(method.id)}
                      >
                        <Text style={styles.setDefaultText}>Set as Default</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteCard(method.id)}
                    >
                      <Trash2 size={18} color="#999" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Add New Card */}
          {!showAddCard ? (
            <TouchableOpacity
              style={styles.addCardButton}
              onPress={() => setShowAddCard(true)}
            >
              <Plus size={20} color="#000" />
              <Text style={styles.addCardButtonText}>ADD NEW CARD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addCardForm}>
              <Text style={styles.sectionTitle}>ADD NEW CARD</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                placeholderTextColor="#999"
                value={newCard.number}
                onChangeText={(text) => setNewCard({ ...newCard, number: formatCardNumber(text) })}
                keyboardType="numeric"
                maxLength={19}
              />
              
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="MM/YY"
                  placeholderTextColor="#999"
                  value={newCard.expiry}
                  onChangeText={(text) => setNewCard({ ...newCard, expiry: formatExpiry(text) })}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="CVV"
                  placeholderTextColor="#999"
                  value={newCard.cvv}
                  onChangeText={(text) => setNewCard({ ...newCard, cvv: text })}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
              
              <TextInput
                style={styles.input}
                placeholder="Cardholder Name"
                placeholderTextColor="#999"
                value={newCard.name}
                onChangeText={(text) => setNewCard({ ...newCard, name: text })}
                autoCapitalize="words"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Billing ZIP Code"
                placeholderTextColor="#999"
                value={newCard.zipCode}
                onChangeText={(text) => setNewCard({ ...newCard, zipCode: text })}
                keyboardType="numeric"
                maxLength={5}
              />
              
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddCard(false);
                    setNewCard({ number: "", expiry: "", cvv: "", name: "", zipCode: "" });
                  }}
                >
                  <Text style={styles.cancelButtonText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleAddCard}>
                  <Text style={styles.saveButtonText}>SAVE CARD</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Other Payment Methods */}
          <View style={styles.otherPayments}>
            <Text style={styles.sectionTitle}>OTHER PAYMENT OPTIONS</Text>
            <TouchableOpacity style={styles.paymentOption}>
              <Text style={styles.paymentOptionText}>Apple Pay</Text>
              <Text style={styles.paymentOptionStatus}>Available at checkout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.paymentOption}>
              <Text style={styles.paymentOptionText}>Google Pay</Text>
              <Text style={styles.paymentOptionStatus}>Available at checkout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.paymentOption}>
              <Text style={styles.paymentOptionText}>PayPal</Text>
              <Text style={styles.paymentOptionStatus}>Connect account at checkout</Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>PAYMENT SECURITY</Text>
            <Text style={styles.infoText}>
              All transactions are secured with 256-bit SSL encryption. 
              We never store your full card details on our servers.
            </Text>
            <Text style={styles.infoText}>
              Your payment information is tokenized and processed through 
              PCI-compliant payment gateways.
            </Text>
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
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "#f0f9f0",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
  },
  securityText: {
    fontSize: 12,
    color: "#4CAF50",
  },
  cardsSection: {
    padding: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 1,
    marginBottom: 20,
  },
  cardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  cardType: {
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardTypeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600" as const,
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  defaultBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  cardName: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: "#999",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  setDefaultButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  setDefaultText: {
    fontSize: 12,
    color: "#666",
  },
  deleteButton: {
    padding: 8,
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    marginHorizontal: 30,
    marginVertical: 20,
    borderWidth: 2,
    borderColor: "#000",
    borderStyle: "dashed",
  },
  addCardButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 1,
  },
  addCardForm: {
    padding: 30,
    backgroundColor: "#fafafa",
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  formButtons: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 1,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#000",
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 1,
  },
  otherPayments: {
    padding: 30,
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  paymentOptionText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  paymentOptionStatus: {
    fontSize: 12,
    color: "#666",
  },
  infoSection: {
    padding: 30,
    backgroundColor: "#fafafa",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 1,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#666",
    marginBottom: 12,
  },
});