import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { router } from "expo-router";
import { Trash2, Plus, Minus } from "lucide-react-native";

export default function CartScreen() {
  const { items, removeFromCart, updateQuantity, getTotal, itemCount } = useCart();
  const { isAuthenticated, isLoading } = useAuth();
  const subtotal = getTotal();
  const shipping = subtotal > 150 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    console.log("Checkout pressed", { isAuthenticated, isLoading, itemCount });
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      // Navigate to login - user can continue as guest or sign in
      router.push("/login");
      return;
    }
    router.push("/checkout");
  };

  const handleQuantityChange = async (id: string, size: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty <= 0) {
      if (Platform.OS === 'web') {
        const shouldRemove = typeof globalThis.confirm === 'function'
          ? globalThis.confirm('Are you sure you want to remove this item from your cart?')
          : true;
        if (shouldRemove) {
          await removeFromCart(id, size);
        }
      } else {
        Alert.alert(
          'Remove Item',
          'Are you sure you want to remove this item from your cart?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', onPress: () => removeFromCart(id, size), style: 'destructive' },
          ]
        );
      }
    } else {
      await updateQuantity(id, size, newQty);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>YOUR BAG IS EMPTY</Text>
          <Text style={styles.emptyText}>
            Add items to your bag to continue shopping
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push("/shop")}
          >
            <Text style={styles.shopButtonText}>CONTINUE SHOPPING</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>SHOPPING BAG ({itemCount})</Text>
          <Text style={styles.helperText}>Tap Remove to delete an item or use − / + to change quantity.</Text>
        </View>

        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <View key={`${item.id}-${item.size}-${index}`} style={styles.item}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemTitleBlock}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {Boolean(item.description) && (
                      <Text numberOfLines={2} style={styles.itemDescription}>{item.description}</Text>
                    )}
                    <Text style={styles.itemSize}>Size: {item.size}</Text>
                  </View>
                  <View style={styles.removeGroup}>
                    <TouchableOpacity
                      onPress={() => removeFromCart(item.id, item.size)}
                      style={styles.removeButton}
                      testID={`remove-item-${item.id}-${item.size}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${item.name} size ${item.size} from cart`}
                    >
                      <Trash2 size={18} color="#999" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeFromCart(item.id, item.size)}
                      style={styles.removeTextButton}
                      testID={`remove-text-${item.id}-${item.size}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${item.name} size ${item.size} from cart`}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.itemFooter}>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleQuantityChange(item.id, item.size, item.quantity, -1)}
                    >
                      <Minus size={16} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleQuantityChange(item.id, item.size, item.quantity, 1)}
                    >
                      <Plus size={16} color="#000" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.actionsRight}>
                    <Text style={styles.itemPrice}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      onPress={async () => {
                        if (Platform.OS === 'web') {
                          const shouldDelete = typeof globalThis.confirm === 'function'
                            ? globalThis.confirm(`Delete ${item.name} (size ${item.size}) from your bag?`)
                            : true;
                          if (shouldDelete) {
                            await removeFromCart(item.id, item.size);
                          }
                        } else {
                          Alert.alert(
                            'Remove Item',
                            `Delete ${item.name} (size ${item.size}) from your bag?`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Delete', onPress: () => removeFromCart(item.id, item.size), style: 'destructive' },
                            ]
                          );
                        }
                      }}
                      style={styles.deleteButton}
                      testID={`delete-item-${item.id}-${item.size}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${item.name} size ${item.size} from cart`}
                    >
                      <Trash2 size={16} color="#B00020" />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>
              {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated Tax</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.promoContainer}>
          <Text style={styles.promoText}>Have a promo code?</Text>
          <TouchableOpacity>
            <Text style={styles.promoLink}>Enter Code</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
          disabled={isLoading || items.length === 0}
          testID="proceed-to-checkout-button"
          accessibilityRole="button"
          accessibilityLabel="Proceed to checkout"
        >
          <Text style={styles.checkoutButtonText}>PROCEED TO CHECKOUT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.back()}
          testID="continue-shopping-button"
          accessibilityRole="button"
          accessibilityLabel="Continue shopping"
        >
          <Text style={styles.continueButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "300" as const,
    letterSpacing: 2,
  },
  helperText: {
    marginTop: 6,
    fontSize: 12,
    color: "#777",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "300" as const,
    letterSpacing: 2,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: "#000",
    paddingHorizontal: 30,
    paddingVertical: 14,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 1,
  },
  itemsContainer: {
    padding: 20,
  },
  item: {
    flexDirection: "row",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemImage: {
    width: 100,
    height: 120,
    backgroundColor: "#f5f5f5",
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500" as const,
    marginBottom: 4,
  },
  itemTitleBlock: {
    maxWidth: 260,
  },
  itemDescription: {
    fontSize: 12,
    color: "#777",
    lineHeight: 18,
    marginBottom: 6,
  },
  itemSize: {
    fontSize: 12,
    color: "#666",
  },
  removeGroup: {
    alignItems: "flex-end",
  },
  removeButton: {
    padding: 4,
    alignSelf: "flex-end",
  },
  removeTextButton: {
    paddingVertical: 2,
  },
  removeText: {
    fontSize: 12,
    color: "#888",
    textDecorationLine: "underline",
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  quantityButton: {
    padding: 8,
  },
  quantity: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "500" as const,
  },
  actionsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "500" as const,
    marginRight: 8,
  },
  summary: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  promoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  promoText: {
    fontSize: 14,
    color: "#666",
  },
  promoLink: {
    fontSize: 14,
    color: "#000",
    textDecorationLine: "underline",
  },
  bottomBar: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  checkoutButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 1,
  },
  continueButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  continueButtonText: {
    fontSize: 14,
    color: "#666",
    textDecorationLine: "underline",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#F2B8B5",
    backgroundColor: "#FFF5F5",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: "#B00020",
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 0.5,
  },
});