import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanAccount } from '../hooks/usePanAccounts';
import { colors } from '../theme/colors';

interface PanManagerModalProps {
  visible: boolean;
  onClose: () => void;
  accounts: PanAccount[];
  onAddAccount: (holderName: string, panNumber: string) => Promise<PanAccount>;
  onDeleteAccount: (id: string) => Promise<void>;
}

export const PanManagerModal: React.FC<PanManagerModalProps> = ({
  visible,
  onClose,
  accounts,
  onAddAccount,
  onDeleteAccount,
}) => {
  const [holderName, setHolderName] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdd = async () => {
    setErrorMsg('');
    if (!holderName.trim()) {
      setErrorMsg('Please enter account holder name (e.g., Self, Dad).');
      return;
    }
    const cleanPan = panNumber.trim().toUpperCase();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPan)) {
      setErrorMsg('Enter a valid PAN in the format ABCDE1234F.');
      return;
    }

    try {
      await onAddAccount(holderName, cleanPan);
      setHolderName('');
      setPanNumber('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add PAN card.');
    }
  };

  const handleDelete = (acc: PanAccount) => {
    Alert.alert(
      'Remove PAN Account',
      `Are you sure you want to remove ${acc.holderName} (${acc.panNumber.substring(0, 5)}****${acc.panNumber.substring(9)})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onDeleteAccount(acc.id),
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="card" size={20} color={colors.primary} />
              <Text style={styles.title}>Family PAN Portfolio</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.description}>
              Save PAN profiles now. Automatic checks will activate only after an approved allotment data API is connected.
            </Text>

            <View style={styles.privacyNotice}>
              <Ionicons name="lock-closed-outline" size={15} color={colors.primaryDark} />
              <Text style={styles.privacyNoticeText}>
                PAN numbers are encrypted on Android and iOS and are sent only when you start an approved live check. Web storage depends on browser security.
              </Text>
            </View>

            {/* Saved Accounts List */}
            <Text style={styles.sectionTitle}>Saved PAN Cards ({accounts.length})</Text>
            {accounts.map((acc) => (
              <View key={acc.id} style={styles.accountCard}>
                <View style={styles.accountInfo}>
                  <Text style={styles.holderName}>{acc.holderName}</Text>
                  <Text style={styles.panMasked}>
                    {acc.panNumber.substring(0, 5)}****{acc.panNumber.substring(9)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(acc)}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add New PAN Card Form */}
            <View style={styles.addFormCard}>
              <Text style={styles.formTitle}>+ Add New PAN Card</Text>

              {Boolean(errorMsg) && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={14} color="#DC2626" />
                  <Text style={styles.errorBannerText}>{errorMsg}</Text>
                </View>
              )}

              <Text style={styles.inputLabel}>Account Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Self, Spouse, Father"
                placeholderTextColor={colors.textMuted}
                value={holderName}
                onChangeText={setHolderName}
              />

              <Text style={styles.inputLabel}>PAN Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit PAN (e.g. ABCDE1234F)"
                placeholderTextColor={colors.textMuted}
                value={panNumber}
                onChangeText={(t) => setPanNumber(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={10}
              />

              <TouchableOpacity style={styles.addSubmitBtn} onPress={handleAdd}>
                <Ionicons name="add-circle" size={16} color="#FFFFFF" />
                <Text style={styles.addSubmitBtnText}>Save PAN Profile</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  description: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  privacyNoticeText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textHeading,
    marginBottom: 10,
  },
  accountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accountInfo: {
    gap: 2,
  },
  holderName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  panMasked: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  addFormCard: {
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 12,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    gap: 6,
  },
  errorBannerText: {
    fontSize: 11.5,
    color: '#DC2626',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: colors.text,
  },
  addSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 14,
    gap: 6,
  },
  addSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
