import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Heart, Ruler, ShoppingBag, Truck } from "lucide-react-native";
import { products } from "@/data/products";
import { useCart } from "@/providers/CartProvider";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const product = products.find(p => p.id === id);
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Product not found</Text>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      image: product.image,
      quantity: 1,
      description: product.description,
    });
    
    router.push("/shop");
  };

  const toggleFavorite = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsFavorite(!isFavorite);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <Heart 
              size={24} 
              color={isFavorite ? "#d32f2f" : "#000"} 
              fill={isFavorite ? "#d32f2f" : "none"}
            />
          </TouchableOpacity>
        </View>

        {/* Product Images */}
        <View style={styles.imageContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
              setImageIndex(newIndex);
            }}
          >
            {product.images.map((image, index) => (
              <Image 
                key={index}
                source={{ uri: image }} 
                style={styles.productImage} 
              />
            ))}
          </ScrollView>
          <View style={styles.imageDots}>
            {product.images.map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.dot,
                  index === imageIndex && styles.activeDot
                ]}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>${product.price}</Text>
          
          {product.stock <= 5 && product.stock > 0 && (
            <Text style={styles.scarcityText}>⚡ Only {product.stock} left in stock</Text>
          )}

          {/* Size Selection */}
          <View style={styles.sizeSection}>
            <View style={styles.sizeHeader}>
              <Text style={styles.sectionTitle}>SELECT SIZE</Text>
              <TouchableOpacity 
                style={styles.sizeGuideButton}
                onPress={() => router.push("/size-guide")}
              >
                <Ruler size={16} color="#666" />
                <Text style={styles.sizeGuideText}>Size Guide</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sizeOptions}>
              {product.sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.sizeButtonActive,
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={[
                      styles.sizeButtonText,
                      selectedSize === size && styles.sizeButtonTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>DETAILS</Text>
            <Text style={styles.description}>{product.description}</Text>
            
            <View style={styles.features}>
              <Text style={styles.feature}>• 100% Premium Cotton</Text>
              <Text style={styles.feature}>• Pre-shrunk fabric</Text>
              <Text style={styles.feature}>• Machine washable</Text>
              <Text style={styles.feature}>• Made in Italy</Text>
            </View>
          </View>

          {/* Shipping Info */}
          <View style={styles.shippingInfo}>
            <Truck size={20} color="#666" />
            <Text style={styles.shippingText}>
              Free shipping on orders over $150
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            !selectedSize && styles.addToCartButtonDisabled
          ]}
          onPress={handleAddToCart}
          disabled={!selectedSize || product.stock === 0}
        >
          <ShoppingBag size={20} color="#fff" />
          <Text style={styles.addToCartText}>
            {product.stock === 0 ? "OUT OF STOCK" : "ADD TO CART"}
          </Text>
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
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
  },
  productImage: {
    width: width,
    height: height * 0.6,
    resizeMode: "cover",
  },
  imageDots: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  activeDot: {
    backgroundColor: "#fff",
    width: 24,
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: "300" as const,
    letterSpacing: 1,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "500" as const,
    marginBottom: 12,
  },
  scarcityText: {
    fontSize: 14,
    color: "#d32f2f",
    fontStyle: "italic",
    marginBottom: 20,
  },
  sizeSection: {
    marginVertical: 20,
  },
  sizeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 1,
  },
  sizeGuideButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sizeGuideText: {
    fontSize: 12,
    color: "#666",
    textDecorationLine: "underline",
  },
  sizeOptions: {
    flexDirection: "row",
    gap: 10,
  },
  sizeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    minWidth: 50,
    alignItems: "center",
  },
  sizeButtonActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  sizeButtonText: {
    fontSize: 14,
    color: "#666",
  },
  sizeButtonTextActive: {
    color: "#fff",
  },
  descriptionSection: {
    marginVertical: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
    marginTop: 8,
  },
  features: {
    marginTop: 16,
    gap: 8,
  },
  feature: {
    fontSize: 14,
    color: "#666",
  },
  shippingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  shippingText: {
    fontSize: 14,
    color: "#666",
  },
  bottomBar: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  addToCartButton: {
    backgroundColor: "#000",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  addToCartButtonDisabled: {
    backgroundColor: "#ccc",
  },
  addToCartText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 1,
  },
});