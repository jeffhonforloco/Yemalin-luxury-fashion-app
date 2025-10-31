import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/trpc';
import { CheckCircle, XCircle, Loader } from 'lucide-react-native';
import { emailStorage } from '@/lib/emailStorage';

type TestResult = {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
};

export default function BackendTestEnhanced() {
  const [name, setName] = useState<string>('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  // Test mutations/queries
  const hiMutation = trpc.example.hi.useMutation();
  const dashboardQuery = trpc.admin.dashboard.useQuery();
  const emailStatsQuery = trpc.admin.emails.getStats.useQuery();
  const cartStatsQuery = trpc.admin.carts.getStats.useQuery();
  const analyticsQuery = trpc.admin.analytics.getAnalytics.useQuery({ dateRange: 'month' });

  const runTests = async () => {
    setTesting(true);
    const testResults: TestResult[] = [];

    // Test 1: Basic API Connection
    try {
      testResults.push({ name: 'Basic API Connection', status: 'pending' });
      const response = await fetch(`${process.env.EXPO_PUBLIC_RORK_API_BASE_URL}/api/`);
      if (response.ok) {
        testResults[0] = { name: 'Basic API Connection', status: 'success', message: 'API is running' };
      } else {
        throw new Error('API not responding');
      }
    } catch (error: any) {
      testResults[0] = { name: 'Basic API Connection', status: 'error', message: error.message };
    }

    // Test 2: tRPC Example Route
    try {
      testResults.push({ name: 'tRPC Example Route', status: 'pending' });
      if (name.trim()) {
        await hiMutation.mutateAsync({ name: name.trim() });
        testResults[1] = { name: 'tRPC Example Route', status: 'success', message: 'Route working' };
      } else {
        testResults[1] = { name: 'tRPC Example Route', status: 'success', message: 'Ready (enter name to test)' };
      }
    } catch (error: any) {
      testResults[1] = { name: 'tRPC Example Route', status: 'error', message: error.message };
    }

    // Test 3: Admin Dashboard
    try {
      testResults.push({ name: 'Admin Dashboard Route', status: 'pending' });
      await dashboardQuery.refetch();
      if (dashboardQuery.data) {
        testResults[2] = { name: 'Admin Dashboard Route', status: 'success', message: 'Dashboard data loaded' };
      } else {
        throw new Error('No data returned');
      }
    } catch (error: any) {
      testResults[2] = { name: 'Admin Dashboard Route', status: 'error', message: error.message };
    }

    // Test 4: Email Stats
    try {
      testResults.push({ name: 'Email Stats Route', status: 'pending' });
      await emailStatsQuery.refetch();
      if (emailStatsQuery.data) {
        testResults[3] = { name: 'Email Stats Route', status: 'success', message: 'Email stats loaded' };
      } else {
        throw new Error('No data returned');
      }
    } catch (error: any) {
      testResults[3] = { name: 'Email Stats Route', status: 'error', message: error.message };
    }

    // Test 5: Cart Stats
    try {
      testResults.push({ name: 'Cart Stats Route', status: 'pending' });
      await cartStatsQuery.refetch();
      if (cartStatsQuery.data) {
        testResults[4] = { name: 'Cart Stats Route', status: 'success', message: 'Cart stats loaded' };
      } else {
        throw new Error('No data returned');
      }
    } catch (error: any) {
      testResults[4] = { name: 'Cart Stats Route', status: 'error', message: error.message };
    }

    // Test 6: Analytics
    try {
      testResults.push({ name: 'Analytics Route', status: 'pending' });
      await analyticsQuery.refetch();
      if (analyticsQuery.data) {
        testResults[5] = { name: 'Analytics Route', status: 'success', message: 'Analytics loaded' };
      } else {
        throw new Error('No data returned');
      }
    } catch (error: any) {
      testResults[5] = { name: 'Analytics Route', status: 'error', message: error.message };
    }

    // Test 7: Email Storage (Local)
    try {
      testResults.push({ name: 'Email Storage Service', status: 'pending' });
      const stats = await emailStorage.getEmailStats();
      testResults[6] = { 
        name: 'Email Storage Service', 
        status: 'success', 
        message: `${stats.total} emails stored` 
      };
    } catch (error: any) {
      testResults[6] = { name: 'Email Storage Service', status: 'error', message: error.message };
    }

    setResults(testResults);
    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color="#4CAF50" />;
      case 'error':
        return <XCircle size={20} color="#d32f2f" />;
      default:
        return <Loader size={20} color="#666" />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Connection Test</Text>
      <Text style={styles.subtitle}>Verify all API endpoints are working</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your name (for example route test)"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#666"
      />

      <TouchableOpacity
        style={[styles.button, testing && styles.buttonDisabled]}
        onPress={runTests}
        disabled={testing}
      >
        {testing ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.buttonText}>Testing...</Text>
          </>
        ) : (
          <Text style={styles.buttonText}>RUN ALL TESTS</Text>
        )}
      </TouchableOpacity>

      {hiMutation.data && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Example Route Result:</Text>
          <Text style={styles.resultText}>
            Hello {hiMutation.data.hello} - {new Date(hiMutation.data.date).toLocaleString()}
          </Text>
        </View>
      )}

      {results.length > 0 && (
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>TEST RESULTS</Text>
          {results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                {getStatusIcon(result.status)}
                <Text style={styles.resultName}>{result.name}</Text>
              </View>
              {result.message && (
                <Text style={[
                  styles.resultMessage,
                  result.status === 'error' && styles.errorMessage,
                  result.status === 'success' && styles.successMessage,
                ]}>
                  {result.message}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {dashboardQuery.data && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>QUICK SUMMARY</Text>
          <Text style={styles.summaryText}>
            Emails: {dashboardQuery.data.emails.total.toLocaleString()}
          </Text>
          <Text style={styles.summaryText}>
            Abandoned Carts: {dashboardQuery.data.carts.abandoned.toLocaleString()}
          </Text>
          <Text style={styles.summaryText}>
            Recovery Rate: {dashboardQuery.data.carts.recoveryRate.toFixed(1)}%
          </Text>
          <Text style={styles.summaryText}>
            Total Revenue: ${dashboardQuery.data.orders.revenue.toLocaleString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fafafa',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  resultBox: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#0369a1',
  },
  resultText: {
    fontSize: 14,
    color: '#0369a1',
  },
  resultsContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  resultItem: {
    padding: 12,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  resultMessage: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 28,
  },
  errorMessage: {
    color: '#d32f2f',
  },
  successMessage: {
    color: '#4CAF50',
  },
  summaryBox: {
    backgroundColor: '#fafafa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#666',
  },
  summaryText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
    fontWeight: '500',
  },
});

