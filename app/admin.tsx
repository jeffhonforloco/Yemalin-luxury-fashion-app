import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Mail, 
  DollarSign, 
  BarChart3,
  ArrowLeft,
  X,
  CheckCircle,
  Settings,
} from 'lucide-react-native';
import { emailStorage } from '@/lib/emailStorage';
import BackendTestEnhanced from '@/components/BackendTestEnhanced';

type TabType = 'dashboard' | 'emails' | 'carts' | 'analytics' | 'orders' | 'backend';

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard } = trpc.admin.dashboard.useQuery();
  
  // Fetch email stats
  const { data: emailStats, refetch: refetchEmails } = trpc.admin.emails.getStats.useQuery();
  
  // Fetch cart stats
  const { data: cartStats, refetch: refetchCarts } = trpc.admin.carts.getStats.useQuery();
  
  // Fetch analytics
  const { data: analytics, refetch: refetchAnalytics } = trpc.admin.analytics.getAnalytics.useQuery({
    dateRange: 'month',
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchDashboard(),
      refetchEmails(),
      refetchCarts(),
      refetchAnalytics(),
    ]);
    setRefreshing(false);
  };

  const renderDashboard = () => {
    if (dashboardLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      );
    }

    return (
      <View style={styles.dashboardContent}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Mail color="#000" size={20} />
              <Text style={styles.statLabel}>Total Emails</Text>
            </View>
            <Text style={styles.statValue}>{dashboardData?.emails.total.toLocaleString() || '0'}</Text>
            <Text style={styles.statSubtext}>
              {dashboardData?.emails.subscribed || 0} subscribed
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <ShoppingBag color="#000" size={20} />
              <Text style={styles.statLabel}>Abandoned Carts</Text>
            </View>
            <Text style={styles.statValue}>{dashboardData?.carts.abandoned.toLocaleString() || '0'}</Text>
            <Text style={styles.statSubtext}>
              {dashboardData?.carts.recoveryRate.toFixed(1) || '0'}% recovered
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <DollarSign color="#000" size={20} />
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>
            <Text style={styles.statValue}>${(dashboardData?.orders.revenue || 0).toLocaleString()}</Text>
            <Text style={styles.statSubtext}>
              {dashboardData?.orders.total || 0} orders
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Users color="#000" size={20} />
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <Text style={styles.statValue}>{dashboardData?.users.total.toLocaleString() || '0'}</Text>
            <Text style={styles.statSubtext}>
              {dashboardData?.users.vip || 0} VIP members
            </Text>
          </View>
        </View>

        {/* Email Sources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EMAIL COLLECTION BY SOURCE</Text>
          <View style={styles.sourceList}>
            {dashboardData?.emails.bySource && Object.entries(dashboardData.emails.bySource).map(([source, count]) => (
              <View key={source} style={styles.sourceItem}>
                <Text style={styles.sourceName}>{source.toUpperCase()}</Text>
                <Text style={styles.sourceCount}>{count?.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Cart Recovery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CART RECOVERY STATS</Text>
          <View style={styles.recoveryCard}>
            <View style={styles.recoveryRow}>
              <Text style={styles.recoveryLabel}>Abandoned:</Text>
              <Text style={styles.recoveryValue}>{dashboardData?.carts.abandoned || 0}</Text>
            </View>
            <View style={styles.recoveryRow}>
              <Text style={styles.recoveryLabel}>Recovered:</Text>
              <Text style={[styles.recoveryValue, styles.successText]}>
                {dashboardData?.carts.recovered || 0}
              </Text>
            </View>
            <View style={styles.recoveryRow}>
              <Text style={styles.recoveryLabel}>Recovery Rate:</Text>
              <Text style={[styles.recoveryValue, styles.successText]}>
                {dashboardData?.carts.recoveryRate.toFixed(1) || '0'}%
              </Text>
            </View>
            <View style={styles.recoveryRow}>
              <Text style={styles.recoveryLabel}>Total Cart Value:</Text>
              <Text style={styles.recoveryValue}>
                ${(dashboardData?.carts.totalValue || 0).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Marketing Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MARKETING PERFORMANCE</Text>
          <View style={styles.marketingCard}>
            <View style={styles.marketingRow}>
              <Text style={styles.marketingLabel}>Emails Sent:</Text>
              <Text style={styles.marketingValue}>
                {dashboardData?.marketing.emailsSent.toLocaleString() || '0'}
              </Text>
            </View>
            <View style={styles.marketingRow}>
              <Text style={styles.marketingLabel}>Open Rate:</Text>
              <Text style={styles.marketingValue}>
                {dashboardData?.marketing.openRate.toFixed(1) || '0'}%
              </Text>
            </View>
            <View style={styles.marketingRow}>
              <Text style={styles.marketingLabel}>Click Rate:</Text>
              <Text style={styles.marketingValue}>
                {dashboardData?.marketing.clickRate.toFixed(1) || '0'}%
              </Text>
            </View>
            <View style={styles.marketingRow}>
              <Text style={styles.marketingLabel}>Conversion Rate:</Text>
              <Text style={[styles.marketingValue, styles.successText]}>
                {dashboardData?.marketing.conversionRate.toFixed(1) || '0'}%
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmails = () => {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>EMAIL MANAGEMENT</Text>
        
        {emailStats && (
          <View style={styles.statsContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Total Emails</Text>
              <Text style={styles.infoValue}>{emailStats.total.toLocaleString()}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Subscribed</Text>
              <Text style={styles.infoValue}>{emailStats.subscribed.toLocaleString()}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Unsubscribed</Text>
              <Text style={styles.infoValue}>{emailStats.unsubscribed.toLocaleString()}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>EMAILS BY SOURCE</Text>
              {emailStats.bySource && Object.entries(emailStats.bySource).map(([source, count]) => (
                <View key={source} style={styles.sourceItem}>
                  <Text style={styles.sourceName}>{source.toUpperCase()}</Text>
                  <Text style={styles.sourceCount}>{count?.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderCarts = () => {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>ABANDONED CART RECOVERY</Text>
        
        {cartStats && (
          <View style={styles.statsContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Total Abandoned</Text>
              <Text style={styles.infoValue}>{cartStats.abandoned.toLocaleString()}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Recovered</Text>
              <Text style={[styles.infoValue, styles.successText]}>
                {cartStats.recovered.toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Recovery Rate</Text>
              <Text style={[styles.infoValue, styles.successText]}>
                {cartStats.recoveryRate.toFixed(1)}%
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Total Value</Text>
              <Text style={styles.infoValue}>
                ${cartStats.totalValue.toLocaleString()}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>REMINDERS SENT</Text>
              <View style={styles.sourceItem}>
                <Text style={styles.sourceName}>First Reminder (1hr)</Text>
                <Text style={styles.sourceCount}>{cartStats.remindersSent.first.toLocaleString()}</Text>
              </View>
              <View style={styles.sourceItem}>
                <Text style={styles.sourceName}>Second Reminder (24hr)</Text>
                <Text style={styles.sourceCount}>{cartStats.remindersSent.second.toLocaleString()}</Text>
              </View>
              <View style={styles.sourceItem}>
                <Text style={styles.sourceName}>Third Reminder (72hr)</Text>
                <Text style={styles.sourceCount}>{cartStats.remindersSent.third.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>RECOVERY BY REMINDER</Text>
              <View style={styles.sourceItem}>
                <Text style={styles.sourceName}>From 1st Reminder</Text>
                <Text style={[styles.sourceCount, styles.successText]}>
                  {cartStats.recoveryByReminder.first.toLocaleString()}
                </Text>
              </View>
              <View style={styles.sourceItem}>
                <Text style={styles.sourceName}>From 2nd Reminder</Text>
                <Text style={[styles.sourceCount, styles.successText]}>
                  {cartStats.recoveryByReminder.second.toLocaleString()}
                </Text>
              </View>
              <View style={styles.sourceItem}>
                <Text style={styles.sourceName}>From 3rd Reminder</Text>
                <Text style={[styles.sourceCount, styles.successText]}>
                  {cartStats.recoveryByReminder.third.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderAnalytics = () => {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>ANALYTICS & CONVERSIONS</Text>
        
        {analytics && (
          <View style={styles.statsContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CONVERSION RATES</Text>
              <View style={styles.conversionItem}>
                <Text style={styles.conversionLabel}>Homepage → Shop</Text>
                <Text style={styles.conversionValue}>
                  {analytics.conversions.homepageToShop.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.conversionItem}>
                <Text style={styles.conversionLabel}>Shop → Cart</Text>
                <Text style={styles.conversionValue}>
                  {analytics.conversions.shopToCart.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.conversionItem}>
                <Text style={styles.conversionLabel}>Cart → Checkout</Text>
                <Text style={styles.conversionValue}>
                  {analytics.conversions.cartToCheckout.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.conversionItem}>
                <Text style={styles.conversionLabel}>Checkout → Order</Text>
                <Text style={[styles.conversionValue, styles.successText]}>
                  {analytics.conversions.checkoutToOrder.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.conversionItem}>
                <Text style={styles.conversionLabel}>Overall Conversion</Text>
                <Text style={[styles.conversionValue, styles.successText]}>
                  {analytics.conversions.overall.toFixed(1)}%
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>MARKETING METRICS</Text>
              <View style={styles.conversionItem}>
                <Text style={styles.conversionLabel}>Email Open Rate</Text>
                <Text style={styles.conversionValue}>
                  {analytics.marketing.emailOpenRate.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.conversionItem}>
                <Text style={styles.conversionLabel}>Email Click Rate</Text>
                <Text style={styles.conversionValue}>
                  {analytics.marketing.emailClickRate.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.conversionItem}>
                <Text style={styles.conversionLabel}>Email Conversion</Text>
                <Text style={[styles.conversionValue, styles.successText]}>
                  {analytics.marketing.emailConversionRate.toFixed(1)}%
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>REVENUE BREAKDOWN</Text>
              <View style={styles.conversionItem}>
                <Text style={styles.conversionLabel}>Total Revenue</Text>
                <Text style={styles.conversionValue}>
                  ${analytics.revenue.total.toLocaleString()}
                </Text>
              </View>
              <View style={styles.conversionItem}>
                <Text style={styles.conversionLabel}>From Cart Recovery</Text>
                <Text style={[styles.conversionValue, styles.successText]}>
                  ${analytics.revenue.fromCartRecovery.toLocaleString()}
                </Text>
              </View>
              <View style={styles.conversionItem}>
                <Text style={styles.conversionLabel}>Recovery % of Revenue</Text>
                <Text style={[styles.conversionValue, styles.successText]}>
                  {analytics.revenue.recoveryPercentage.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderOrders = () => {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>ORDER MANAGEMENT</Text>
        <Text style={styles.comingSoon}>Detailed order management coming soon...</Text>
      </View>
    );
  };

  const renderBackend = () => {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>BACKEND CONNECTION TEST</Text>
        <BackendTestEnhanced />
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'emails':
        return renderEmails();
      case 'carts':
        return renderCarts();
      case 'analytics':
        return renderAnalytics();
      case 'orders':
        return renderOrders();
      case 'backend':
        return renderBackend();
      default:
        return renderDashboard();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ADMIN DASHBOARD</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <BarChart3 size={16} color={activeTab === 'dashboard' ? '#000' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
            DASHBOARD
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'emails' && styles.activeTab]}
          onPress={() => setActiveTab('emails')}
        >
          <Mail size={16} color={activeTab === 'emails' ? '#000' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'emails' && styles.activeTabText]}>
            EMAILS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'carts' && styles.activeTab]}
          onPress={() => setActiveTab('carts')}
        >
          <ShoppingBag size={16} color={activeTab === 'carts' ? '#000' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'carts' && styles.activeTabText]}>
            CARTS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <TrendingUp size={16} color={activeTab === 'analytics' ? '#000' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            ANALYTICS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <CheckCircle size={16} color={activeTab === 'orders' ? '#000' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            ORDERS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'backend' && styles.activeTab]}
          onPress={() => setActiveTab('backend')}
        >
          <Settings size={16} color={activeTab === 'backend' ? '#000' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'backend' && styles.activeTabText]}>
            BACKEND
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  placeholder: {
    width: 32,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#666',
    textTransform: 'uppercase',
  },
  activeTabText: {
    color: '#000',
  },
  content: {
    flex: 1,
  },
  dashboardContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fafafa',
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#666',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#000',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  sourceList: {
    gap: 12,
  },
  sourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sourceName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  sourceCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  recoveryCard: {
    gap: 12,
  },
  recoveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recoveryLabel: {
    fontSize: 14,
    color: '#666',
  },
  recoveryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  marketingCard: {
    gap: 12,
  },
  marketingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  marketingLabel: {
    fontSize: 14,
    color: '#666',
  },
  marketingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  successText: {
    color: '#4CAF50',
  },
  tabContent: {
    padding: 20,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  statsContainer: {
    gap: 20,
  },
  infoCard: {
    backgroundColor: '#fafafa',
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  conversionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  conversionLabel: {
    fontSize: 14,
    color: '#666',
  },
  conversionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  comingSoon: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 40,
  },
});

