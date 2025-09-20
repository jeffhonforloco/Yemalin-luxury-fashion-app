import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function SizeGuideScreen() {
  const sizeChart = [
    { size: "XS", chest: "32-34", waist: "24-26", hips: "34-36" },
    { size: "S", chest: "34-36", waist: "26-28", hips: "36-38" },
    { size: "M", chest: "36-38", waist: "28-30", hips: "38-40" },
    { size: "L", chest: "38-40", waist: "30-32", hips: "40-42" },
    { size: "XL", chest: "40-42", waist: "32-34", hips: "42-44" },
    { size: "XXL", chest: "42-44", waist: "34-36", hips: "44-46" },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>SIZE GUIDE</Text>
        <Text style={styles.subtitle}>All measurements in inches</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Size</Text>
            <Text style={styles.headerCell}>Chest</Text>
            <Text style={styles.headerCell}>Waist</Text>
            <Text style={styles.headerCell}>Hips</Text>
          </View>
          {sizeChart.map((row) => (
            <View key={row.size} style={styles.tableRow}>
              <Text style={styles.cell}>{row.size}</Text>
              <Text style={styles.cell}>{row.chest}</Text>
              <Text style={styles.cell}>{row.waist}</Text>
              <Text style={styles.cell}>{row.hips}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>HOW TO MEASURE</Text>
          <Text style={styles.tip}>
            <Text style={styles.tipBold}>Chest:</Text> Measure around the fullest part of your chest
          </Text>
          <Text style={styles.tip}>
            <Text style={styles.tipBold}>Waist:</Text> Measure around your natural waistline
          </Text>
          <Text style={styles.tip}>
            <Text style={styles.tipBold}>Hips:</Text> Measure around the fullest part of your hips
          </Text>
        </View>

        <View style={styles.fitInfo}>
          <Text style={styles.fitTitle}>FIT INFORMATION</Text>
          <Text style={styles.fitText}>
            Our T-shirts are designed with a modern, relaxed fit. 
            If you prefer a more fitted look, we recommend sizing down.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "300" as const,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  table: {
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000",
  },
  headerCell: {
    flex: 1,
    padding: 12,
    color: "#fff",
    fontSize: 12,
    fontWeight: "600" as const,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  cell: {
    flex: 1,
    padding: 12,
    fontSize: 12,
    textAlign: "center",
  },
  tips: {
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    letterSpacing: 1,
    marginBottom: 16,
  },
  tip: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
    marginBottom: 8,
  },
  tipBold: {
    fontWeight: "600" as const,
    color: "#000",
  },
  fitInfo: {
    backgroundColor: "#fafafa",
    padding: 20,
  },
  fitTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 1,
    marginBottom: 12,
  },
  fitText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
  },
});