import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard as Edit, Save, X } from 'lucide-react-native';

export default function ReviewPrescription() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    medication: 'Amoxicillin',
    strength: '500mg',
    dosage: '3 times daily',
    quantity: '30 tablets',
    doctor: 'Dr. Smith',
    pharmacy: 'CVS Pharmacy',
    date: '2024-01-15',
    refills: '2',
    instructions: 'Take with food. Complete the full course.',
  });

  const handleSave = () => {
    Alert.alert(
      'Save Prescription',
      'Are you sure you want to save this prescription?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: () => {
            setIsEditing(false);
            Alert.alert('Success', 'Prescription saved successfully!', [
              { text: 'OK', onPress: () => router.push('/(tabs)/history') }
            ]);
          }
        }
      ]
    );
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard this prescription?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  const FormField = ({ label, value, onChangeText, multiline = false }: any) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={[styles.fieldInput, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      ) : (
        <Text style={styles.fieldValue}>{value}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#374151" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Review Prescription</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Edit color="#3B82F6" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>OCR Processing Complete</Text>
          <Text style={styles.statusSubtitle}>
            Please review and edit the extracted information before saving
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Medication Information</Text>
          <View style={styles.formGroup}>
            <FormField
              label="Medication Name"
              value={prescriptionData.medication}
              onChangeText={(text: string) => setPrescriptionData({...prescriptionData, medication: text})}
            />
            <FormField
              label="Strength"
              value={prescriptionData.strength}
              onChangeText={(text: string) => setPrescriptionData({...prescriptionData, strength: text})}
            />
            <FormField
              label="Dosage"
              value={prescriptionData.dosage}
              onChangeText={(text: string) => setPrescriptionData({...prescriptionData, dosage: text})}
            />
            <FormField
              label="Quantity"
              value={prescriptionData.quantity}
              onChangeText={(text: string) => setPrescriptionData({...prescriptionData, quantity: text})}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Prescription Details</Text>
          <View style={styles.formGroup}>
            <FormField
              label="Doctor"
              value={prescriptionData.doctor}
              onChangeText={(text: string) => setPrescriptionData({...prescriptionData, doctor: text})}
            />
            <FormField
              label="Pharmacy"
              value={prescriptionData.pharmacy}
              onChangeText={(text: string) => setPrescriptionData({...prescriptionData, pharmacy: text})}
            />
            <FormField
              label="Date Prescribed"
              value={prescriptionData.date}
              onChangeText={(text: string) => setPrescriptionData({...prescriptionData, date: text})}
            />
            <FormField
              label="Refills"
              value={prescriptionData.refills}
              onChangeText={(text: string) => setPrescriptionData({...prescriptionData, refills: text})}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.formGroup}>
            <FormField
              label="Special Instructions"
              value={prescriptionData.instructions}
              onChangeText={(text: string) => setPrescriptionData({...prescriptionData, instructions: text})}
              multiline
            />
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save color="#FFFFFF" size={20} />
            <Text style={styles.saveButtonText}>Save Prescription</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.discardButton} onPress={handleDiscard}>
            <X color="#EF4444" size={20} />
            <Text style={styles.discardButtonText}>Discard</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  statusCard: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#065F46',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#047857',
  },
  formSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  formGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  fieldValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    paddingVertical: 8,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#F9FAFB',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    gap: 16,
    paddingBottom: 32,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  discardButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  discardButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
  },
});