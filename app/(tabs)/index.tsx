import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, Clock, Shield, TrendingUp, Calendar, Bell } from 'lucide-react-native';
import { prescriptionsApi, healthApi } from '@/utils/api';

export default function Home() {
  const router = useRouter();
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [healthStats, setHealthStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent prescriptions
      const prescriptionsResponse = await prescriptionsApi.getAll();
      if (prescriptionsResponse.success) {
        // Get the 2 most recent prescriptions
        const recent = prescriptionsResponse.prescriptions.slice(0, 2).map(p => ({
          id: p.id,
          medication: p.medication,
          doctor: p.doctor_name,
          date: p.prescription_date,
        }));
        setRecentPrescriptions(recent);
      }

      // Fetch health stats
      const statsResponse = await healthApi.getStats();
      if (statsResponse.success) {
        setHealthStats(statsResponse.stats);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { 
      title: 'Scan Prescription', 
      subtitle: 'Add new prescription', 
      icon: Camera, 
      color: '#3B82F6',
      onPress: () => router.push('/scan')
    },
    { 
      title: 'View History', 
      subtitle: 'All prescriptions', 
      icon: Clock, 
      color: '#10B981',
      onPress: () => router.push('/history')
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.username}>Welcome</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell color="#374151" size={24} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading your health data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning!</Text>
          <Text style={styles.username}>Welcome</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell color="#374151" size={24} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Health Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Health Summary</Text>
            <Shield color="#10B981" size={20} />
          </View>
          <Text style={styles.summarySubtitle}>Your health data is secure and up to date</Text>
          <View style={styles.summaryStats}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {healthStats?.prescriptions?.active || 0}
              </Text>
              <Text style={styles.statLabel}>Active Prescriptions</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {healthStats?.prescriptions?.refillsAvailable || 0}
              </Text>
              <Text style={styles.statLabel}>Upcoming Refills</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.onPress}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <action.icon color="#FFFFFF" size={24} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Prescriptions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Prescriptions</Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.prescriptionsList}>
            {recentPrescriptions.length > 0 ? (
              recentPrescriptions.map((prescription) => (
                <View key={prescription.id} style={styles.prescriptionCard}>
                  <View style={styles.prescriptionInfo}>
                    <Text style={styles.medicationName}>{prescription.medication}</Text>
                    <Text style={styles.doctorName}>{prescription.doctor}</Text>
                  </View>
                  <Text style={styles.prescriptionDate}>{prescription.date}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyPrescriptions}>
                <Text style={styles.emptyText}>No prescriptions yet</Text>
                <Text style={styles.emptySubtext}>Add your first prescription to get started</Text>
              </View>
            )}
          </View>
        </View>

        {/* Health Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Tip</Text>
          <View style={styles.tipCard}>
            <TrendingUp color="#F59E0B" size={24} />
            <Text style={styles.tipText}>
              Keep your prescriptions organized by taking photos immediately after receiving them from your pharmacy.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  username: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  summarySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 20,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  seeAll: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  prescriptionsList: {
    gap: 12,
  },
  prescriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  prescriptionInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  prescriptionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  emptyPrescriptions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 20,
  },
});