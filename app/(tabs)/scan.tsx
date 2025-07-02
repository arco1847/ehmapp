import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, Image as ImageIcon, FileText, Zap, Plus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { prescriptionsApi, ocrApi } from '@/utils/api';

export default function Scan() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualData, setManualData] = useState({
    medication: '',
    strength: '',
    dosage: '',
    quantity: '',
    doctor: '',
    pharmacy: '',
    instructions: '',
    refills: '',
  });

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your photos to scan prescriptions.');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const processImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    try {
      // Convert image to File object for OCR processing
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const file = new File([blob], 'prescription.jpg', { type: 'image/jpeg' });
      
      const ocrResult = await ocrApi.processImage(file);
      
      if (ocrResult.success) {
        // Navigate to review screen with extracted data
        router.push('/review-prescription');
      } else {
        Alert.alert('Error', ocrResult.error || 'Failed to process image');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSave = async () => {
    if (!manualData.medication || !manualData.dosage || !manualData.doctor) {
      Alert.alert('Error', 'Please fill in required fields: Medication, Dosage, and Doctor');
      return;
    }

    try {
      const prescriptionData = {
        medication: `${manualData.medication} ${manualData.strength}`.trim(),
        doctor: manualData.doctor,
        pharmacy: manualData.pharmacy,
        dosage: manualData.dosage,
        quantity: manualData.quantity,
        refills: parseInt(manualData.refills) || 0,
        instructions: manualData.instructions,
        strength: manualData.strength,
      };

      const response = await prescriptionsApi.create(prescriptionData);

      if (response.success) {
        Alert.alert('Success', 'Prescription added successfully!', [
          { text: 'OK', onPress: () => {
            setShowManualEntry(false);
            setManualData({
              medication: '',
              strength: '',
              dosage: '',
              quantity: '',
              doctor: '',
              pharmacy: '',
              instructions: '',
              refills: '',
            });
            router.push('/(tabs)/history');
          }}
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to save prescription');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Network error occurred');
    }
  };

  const ManualEntryModal = () => (
    <Modal
      visible={showManualEntry}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowManualEntry(false)}>
            <X color="#374151" size={24} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Prescription Manually</Text>
          <TouchableOpacity onPress={handleManualSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Medication Information</Text>
            <View style={styles.formGroup}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Medication Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Amoxicillin"
                  value={manualData.medication}
                  onChangeText={(text) => setManualData({...manualData, medication: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Strength</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 500mg"
                  value={manualData.strength}
                  onChangeText={(text) => setManualData({...manualData, strength: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Dosage *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 3 times daily"
                  value={manualData.dosage}
                  onChangeText={(text) => setManualData({...manualData, dosage: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 30 tablets"
                  value={manualData.quantity}
                  onChangeText={(text) => setManualData({...manualData, quantity: text})}
                />
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Prescription Details</Text>
            <View style={styles.formGroup}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Doctor *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Dr. Smith"
                  value={manualData.doctor}
                  onChangeText={(text) => setManualData({...manualData, doctor: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Pharmacy</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., CVS Pharmacy"
                  value={manualData.pharmacy}
                  onChangeText={(text) => setManualData({...manualData, pharmacy: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Refills</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 2"
                  value={manualData.refills}
                  onChangeText={(text) => setManualData({...manualData, refills: text})}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.formGroup}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Special Instructions</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="e.g., Take with food. Complete the full course."
                  value={manualData.instructions}
                  onChangeText={(text) => setManualData({...manualData, instructions: text})}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Prescription</Text>
        <Text style={styles.subtitle}>Take a photo, select from gallery, or add manually</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity
              style={[styles.processButton, isProcessing && styles.processButtonDisabled]}
              onPress={processImage}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Zap color="#FFFFFF" size={20} />
              )}
              <Text style={styles.processButtonText}>
                {isProcessing ? 'Processing...' : 'Extract Data'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadArea}>
            <View style={styles.uploadIcon}>
              <FileText color="#9CA3AF" size={48} />
            </View>
            <Text style={styles.uploadTitle}>No prescription selected</Text>
            <Text style={styles.uploadSubtitle}>
              Choose an option below to get started
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <Camera color="#3B82F6" size={24} />
            <Text style={styles.actionButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={pickFromGallery}>
            <ImageIcon color="#3B82F6" size={24} />
            <Text style={styles.actionButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity 
          style={styles.manualButton} 
          onPress={() => setShowManualEntry(true)}
        >
          <Plus color="#FFFFFF" size={20} />
          <Text style={styles.manualButtonText}>Add Prescription Manually</Text>
        </TouchableOpacity>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for better scanning:</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Ensure good lighting conditions</Text>
            <Text style={styles.tipItem}>• Keep the prescription flat and straight</Text>
            <Text style={styles.tipItem}>• Make sure all text is clearly visible</Text>
            <Text style={styles.tipItem}>• Avoid shadows and glare on the document</Text>
            <Text style={styles.tipItem}>• Fill the frame with the prescription</Text>
            <Text style={styles.tipItem}>• Use a contrasting background if possible</Text>
          </View>
        </View>

        <View style={styles.securityNote}>
          <Text style={styles.securityTitle}>🔒 Your Privacy Matters</Text>
          <Text style={styles.securityText}>
            All prescription images are processed securely and are never stored permanently on our servers. 
            Your health information remains private and protected.
          </Text>
        </View>
      </ScrollView>

      <ManualEntryModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  processButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  processButtonDisabled: {
    opacity: 0.6,
  },
  processButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  uploadArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  manualButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  manualButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  securityNote: {
    backgroundColor: '#EBF4FF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  securityTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E40AF',
    lineHeight: 20,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  saveText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
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
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  input: {
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
});