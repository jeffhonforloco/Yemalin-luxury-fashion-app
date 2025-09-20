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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, ChevronUp, Mail, Phone, MessageCircle, Clock } from "lucide-react-native";
import { router } from "expo-router";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for all unworn items with original tags. Items must be in their original condition. Refunds will be processed within 5-7 business days after we receive your return."
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping takes 5-7 business days. Express shipping (2-3 business days) is available at checkout. Orders over $150 qualify for free standard shipping."
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times vary by location. Import duties and taxes may apply."
  },
  {
    question: "How do I track my order?",
    answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and viewing your order history."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay. All payments are processed securely."
  },
  {
    question: "How do I become a VIP member?",
    answer: "VIP membership is automatically granted when your total purchases reach $500. VIP members enjoy exclusive benefits including early access to new collections, special discounts, and free express shipping."
  },
  {
    question: "Can I modify or cancel my order?",
    answer: "Orders can be modified or cancelled within 1 hour of placement. After this time, the order enters our fulfillment process and cannot be changed."
  },
  {
    question: "What is Supima Cotton?",
    answer: "Supima Cotton is a superior type of cotton grown in the USA. It represents less than 1% of cotton grown worldwide. It's stronger, softer, and holds color better than regular cotton."
  },
];

export default function HelpSupportScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContactSubmit = () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    Alert.alert(
      "Message Sent",
      "Thank you for contacting us. We'll respond within 24 hours.",
      [{ text: "OK", onPress: () => {
        setContactForm({ subject: "", message: "" });
      }}]
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
            <Text style={styles.title}>HELP & SUPPORT</Text>
            <Text style={styles.subtitle}>We're here to assist you</Text>
          </View>

          {/* Quick Contact */}
          <View style={styles.quickContact}>
            <Text style={styles.sectionTitle}>QUICK CONTACT</Text>
            <View style={styles.contactOptions}>
              <TouchableOpacity style={styles.contactOption}>
                <View style={styles.contactIcon}>
                  <Phone size={20} color="#000" />
                </View>
                <View>
                  <Text style={styles.contactTitle}>Call Us</Text>
                  <Text style={styles.contactValue}>1-800-YEMALIN</Text>
                  <Text style={styles.contactHours}>Mon-Fri 9AM-6PM EST</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactOption}>
                <View style={styles.contactIcon}>
                  <Mail size={20} color="#000" />
                </View>
                <View>
                  <Text style={styles.contactTitle}>Email Us</Text>
                  <Text style={styles.contactValue}>support@yemalin.com</Text>
                  <Text style={styles.contactHours}>24/7 Support</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactOption}>
                <View style={styles.contactIcon}>
                  <MessageCircle size={20} color="#000" />
                </View>
                <View>
                  <Text style={styles.contactTitle}>Live Chat</Text>
                  <Text style={styles.contactValue}>Start Chat</Text>
                  <Text style={styles.contactHours}>Available Now</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQs */}
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
            {faqs.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={styles.faqItem}
                onPress={() => toggleFAQ(index)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  {expandedIndex === index ? (
                    <ChevronUp size={20} color="#666" />
                  ) : (
                    <ChevronDown size={20} color="#666" />
                  )}
                </View>
                {expandedIndex === index && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Form */}
          <View style={styles.contactForm}>
            <Text style={styles.sectionTitle}>SEND US A MESSAGE</Text>
            <TextInput
              style={styles.input}
              placeholder="Subject"
              placeholderTextColor="#999"
              value={contactForm.subject}
              onChangeText={(text) => setContactForm({ ...contactForm, subject: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Your message"
              placeholderTextColor="#999"
              value={contactForm.message}
              onChangeText={(text) => setContactForm({ ...contactForm, message: text })}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleContactSubmit}>
              <Text style={styles.submitButtonText}>SEND MESSAGE</Text>
            </TouchableOpacity>
          </View>

          {/* Response Time */}
          <View style={styles.responseTime}>
            <Clock size={16} color="#666" />
            <Text style={styles.responseTimeText}>
              Average response time: 2-4 hours during business hours
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 1,
    marginBottom: 20,
  },
  quickContact: {
    padding: 30,
  },
  contactOptions: {
    gap: 20,
  },
  contactOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  contactTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: "500" as const,
    marginBottom: 2,
  },
  contactHours: {
    fontSize: 11,
    color: "#999",
  },
  faqSection: {
    padding: 30,
    backgroundColor: "#fafafa",
  },
  faqItem: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500" as const,
    marginRight: 12,
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    fontSize: 13,
    lineHeight: 20,
    color: "#666",
  },
  contactForm: {
    padding: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    backgroundColor: "#fafafa",
    marginBottom: 16,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  submitButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 1,
  },
  responseTime: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 20,
    backgroundColor: "#fafafa",
  },
  responseTimeText: {
    fontSize: 12,
    color: "#666",
  },
});