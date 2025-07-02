import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Filter, Calendar, Pill, MoveVertical as MoreVertical, Trash2 } from 'lucide-react-native';
import { prescriptionsApi } from '@/utils/api';

interface Prescription {
  id: number;
  medication: string;
  doctor_name: string;
  dosage: string;
  status: string;
  refills: number;
  prescription_date: string;
  pharmacy_name?: string;
}

export default function History() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await prescriptionsApi.getAll();
      
      if (response.success) {
        setPrescriptions(response.prescriptions || []);
      } else {
        setError(response.error || 'Failed to fetch prescriptions');
      }
    } catch (error: any) {
      console.error('Error fetching prescriptions:', error);
      setError(error.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrescription = (prescriptionId: number, medicationName: string) => {
    Alert.alert(
      'Delete Prescription',
      `Are you sure you want to delete ${medicationName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deletePrescription(prescriptionId)
        }
      ]
    );
  };

  const deletePrescription = async (prescriptionId: number) => {
    try {
      const response = await prescriptionsApi.delete(prescriptionId);

      if (response.success) {
        setPrescriptions(prescriptions.filter((p) => p.id !== prescriptionId));
        Alert.alert('Success', 'Prescription deleted successfully');
      } else {
        Alert.alert('Error', response.error || 'Failed to delete prescription');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Network error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return '#10B981';
      case 'Expired':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const filteredPrescriptions = prescriptions.filter((prescription) =>
    prescription.medication.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.doctor_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activePrescriptions = prescriptions.filter((p) => p.status === 'Active');
  const expiredPrescriptions = prescriptions.filter((p) => p.status === 'Expired');
  const refillsAvailable = prescriptions.filter((p) => p.refills > 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Prescription History</Text>
          <Text style={styles.subtitle}>View and manage your prescriptions</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading prescriptions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Prescription History</Text>
          <Text style={styles.subtitle}>View and manage your prescriptions</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPrescriptions}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prescription History</Text>
        <Text style={styles.subtitle}>View and manage your prescriptions</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color="#9CA3AF" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search prescriptions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color="#6B7280" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activePrescriptions.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{refillsAvailable.length}</Text>
            <Text style={styles.statLabel}>Refills Available</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{expiredPrescriptions.length}</Text>
            <Text style={styles.statLabel}>Expired</Text>
          </View>
        </View>

        <View style={styles.prescriptionsList}>
          {filteredPrescriptions.map((prescription) => (
            <View key={prescription.id} style={styles.prescriptionCard}>
              <View style={styles.prescriptionIcon}>
                <Pill color="#3B82F6" size={24} />
              </View>
              
              <View style={styles.prescriptionInfo}>
                <Text style={styles.medicationName}>{prescription.medication}</Text>
                <Text style={styles.doctorName}>{prescription.doctor_name}</Text>
                <Text style={styles.dosage}>{prescription.dosage}</Text>
                
                <View style={styles.prescriptionMeta}>
                  <View style={styles.metaItem}>
                    <Calendar color="#9CA3AF" size={14} />
                    <Text style={styles.metaText}>{prescription.prescription_date}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(prescription.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(prescription.status) }]}>
                      {prescription.status}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.prescriptionActions}>
                <Text style={styles.refillsText}>{prescription.refills} refills</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeletePrescription(prescription.id, prescription.medication)}
                  >
                    <Trash2 color="#EF4444" size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <MoreVertical color="#9CA3AF" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {filteredPrescriptions.length === 0 && (
          <View style={styles.emptyState}>
            <Pill color="#9CA3AF" size={48} />
            <Text style={styles.emptyTitle}>No prescriptions found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Scan your first prescription to get started'}
            </Text>
          </View>
        )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  prescriptionsList: {
    gap: 16,
  },
  prescriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  prescriptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prescriptionInfo: {
    flex: 1,
    gap: 4,
  },
  medicationName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  doctorName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  dosage: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  prescriptionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  prescriptionActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  refillsText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
});