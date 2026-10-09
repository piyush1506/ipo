import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { IpoItem } from '../types/ipo';
import { formatCurrency } from '../utils/ipoHelpers';
import { colors } from '../theme/colors';
import { usePanAccounts } from '../hooks/usePanAccounts';
import {
  checkAllotmentAccountApi,
  getAllotmentCapability,
  AllotmentCapability,
  AllotmentCheckResult,
} from '../api/ipoApi';
import { PanManagerModal } from './PanManagerModal';
import { AdBanner } from './AdBanner';
import { initInterstitialAd, showInterstitialAd } from '../services/adService';

interface AllotmentCheckerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedIpo?: IpoItem | null;
}

export const AllotmentCheckerModal: React.FC<AllotmentCheckerModalProps> = ({
  visible,
  onClose,
  selectedIpo,
}) => {
  const { accounts, addAccount, deleteAccount } = usePanAccounts();
  const [isPanManagerOpen, setIsPanManagerOpen] = useState(false);
  const [isCheckingApi, setIsCheckingApi] = useState(false);
  const [apiResults, setApiResults] = useState<AllotmentCheckResult[] | null>(null);
  const [apiError, setApiError] = useState('');
  const [checkingAccountId, setCheckingAccountId] = useState<string | null>(null);
  const [completedChecks, setCompletedChecks] = useState(0);
  const [capability, setCapability] = useState<AllotmentCapability>({
    available: false,
    mode: 'disabled',
    message: 'Checking service availability...',
  });

  useEffect(() => {
    if (!visible) return;
    initInterstitialAd();
    let active = true;
    getAllotmentCapability().then((nextCapability) => {
      if (active) setCapability(nextCapability);
    });
    return () => {
      active = false;
    };
  }, [visible]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setApiResults(null);
      setApiError('');
      setCheckingAccountId(null);
      setCompletedChecks(0);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedIpo]);

  const handleRunAutoApiCheck = async () => {
    if (!selectedIpo || accounts.length === 0 || !capability.available) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsCheckingApi(true);
      setApiError('');
      setApiResults([]);
      setCompletedChecks(0);

      let failedChecks = 0;
      for (const account of accounts) {
        setCheckingAccountId(account.id);
        try {
          const result = await checkAllotmentAccountApi(selectedIpo, account);
          setApiResults((current) => [...(current || []), result]);
        } catch (error) {
          failedChecks += 1;
          const pan = account.panNumber.toUpperCase();
          const failedResult: AllotmentCheckResult = {
            accountId: account.id,
            holderName: account.holderName,
            panMasked: `${pan.substring(0, 5)}****${pan.substring(9)}`,
            status: 'ERROR',
            sharesAllotted: 0,
            lotCount: 0,
            amountDebited: 0,
            refundStatus: '',
            applicationNo: '',
            checkedAt: new Date().toISOString(),
            errorMessage: error instanceof Error ? error.message : 'This PAN could not be checked.',
          };
          setApiResults((current) => [...(current || []), failedResult]);
        } finally {
          setCompletedChecks((current) => current + 1);
        }
      }

      if (failedChecks > 0) {
        setApiError(`${failedChecks} of ${accounts.length} PAN checks could not be completed.`);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } finally {
      setCheckingAccountId(null);
      setIsCheckingApi(false);
      showInterstitialAd().catch(() => {});
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark" size={20} color={colors.primaryDark} />
              </View>
              <View style={styles.headerTextBox}>
                <Text style={styles.title}>Allotment Status</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {selectedIpo ? selectedIpo.companyName || selectedIpo.ipoName : 'Automatic PAN checks'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.checkCard}>
              <View style={styles.checkHeader}>
                <View style={styles.checkTitleRow}>
                  <Ionicons name="flash" size={17} color={colors.primary} />
                  <Text style={styles.checkTitle}>Automatic Checker</Text>
                </View>
                <TouchableOpacity style={styles.manageButton} onPress={() => setIsPanManagerOpen(true)}>
                  <Ionicons name="add" size={14} color={colors.primaryDark} />
                  <Text style={styles.manageButtonText}>PANs ({accounts.length})</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.description}>
                Save family PAN profiles now. One tap will check every profile after the approved data API is connected.
              </Text>

              <View style={[styles.availabilityBanner, capability.available && styles.availabilityBannerLive]}>
                <Ionicons
                  name={capability.available ? 'checkmark-circle' : 'time-outline'}
                  size={15}
                  color={capability.available ? '#047857' : '#92400E'}
                />
                <View style={styles.availabilityTextBox}>
                  <Text style={[styles.availabilityTitle, capability.available && styles.availabilityTitleLive]}>
                    {capability.available ? 'Official API connected' : 'Coming soon — approval pending'}
                  </Text>
                  <Text style={styles.availabilityMessage}>{capability.message}</Text>
                </View>
              </View>

              <View style={styles.panChips}>
                {accounts.map((account) => (
                  <View key={account.id} style={styles.panChip}>
                    <Ionicons name="person-circle-outline" size={14} color={colors.primaryDark} />
                    <Text style={styles.panChipText}>
                      {account.holderName} ({account.panNumber.substring(0, 5)}...)
                    </Text>
                  </View>
                ))}
              </View>

              {accounts.length === 0 && (
                <Text style={styles.helperText}>Add at least one PAN profile to prepare automatic checks.</Text>
              )}
              {!selectedIpo && (
                <Text style={styles.helperText}>Open an IPO from Home to prepare a check for that issue.</Text>
              )}

              <TouchableOpacity
                style={[
                  styles.checkButton,
                  (!capability.available || !selectedIpo || accounts.length === 0) && styles.checkButtonDisabled,
                ]}
                onPress={handleRunAutoApiCheck}
                disabled={isCheckingApi || !capability.available || !selectedIpo || accounts.length === 0}
                activeOpacity={0.85}
              >
                <Ionicons name={isCheckingApi ? 'sync' : 'search'} size={16} color="#FFFFFF" />
                <Text style={styles.checkButtonText}>
                  {isCheckingApi
                    ? 'Checking Live Allotment...'
                    : capability.available
                      ? `Check Allotment (${accounts.length} PANs)`
                      : 'Automatic Check Coming Soon'}
                </Text>
              </TouchableOpacity>

              {isCheckingApi && (
                <View style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>
                      Checking PAN {Math.min(completedChecks + 1, accounts.length)} of {accounts.length}
                    </Text>
                    <Text style={styles.progressCount}>{completedChecks}/{accounts.length}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${accounts.length > 0 ? (completedChecks / accounts.length) * 100 : 0}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressAccount}>
                    {accounts.find((account) => account.id === checkingAccountId)?.holderName || 'Preparing next profile...'}
                  </Text>
                </View>
              )}

              {Boolean(apiError) && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={15} color="#B91C1C" />
                  <Text style={styles.errorText}>{apiError}</Text>
                </View>
              )}

              {apiResults && apiResults.length > 0 && (
                <View style={styles.results}>
                  <Text style={styles.resultsTitle}>Allotment Status Results</Text>
                  {apiResults.map((result) => {
                    const isAllotted = result.status === 'ALLOTTED';
                    const isPending = result.status === 'PENDING';
                    const isError = result.status === 'ERROR';
                    return (
                      <View
                        key={result.accountId}
                        style={[
                          styles.resultCard,
                          isError
                            ? styles.resultError
                            : isAllotted
                            ? styles.resultAllotted
                            : isPending
                              ? styles.resultPending
                              : styles.resultNotAllotted,
                        ]}
                      >
                        <View style={styles.resultHeader}>
                          <View>
                            <Text style={styles.resultName}>{result.holderName}</Text>
                            <Text style={styles.resultPan}>{result.panMasked}</Text>
                          </View>
                          <View style={styles.resultBadge}>
                            <Ionicons
                              name={isError ? 'alert-circle' : isAllotted ? 'checkmark-circle' : isPending ? 'time' : 'close-circle'}
                              size={14}
                              color={isError ? '#B91C1C' : isAllotted ? '#047857' : isPending ? '#B45309' : '#DC2626'}
                            />
                            <Text
                              style={[
                                styles.resultBadgeText,
                                { color: isError ? '#B91C1C' : isAllotted ? '#047857' : isPending ? '#B45309' : '#DC2626' },
                              ]}
                            >
                              {isError ? 'FAILED' : isAllotted ? 'ALLOTTED' : isPending ? 'PENDING' : 'NOT ALLOTTED'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.resultDetails}>
                          {isError ? (
                            <Text style={styles.resultErrorText}>
                              {result.errorMessage || 'This PAN could not be checked.'}
                            </Text>
                          ) : isAllotted ? (
                            <>
                              <Text style={styles.resultDetailText}>
                                Shares: <Text style={styles.bold}>{result.sharesAllotted} ({result.lotCount} lot)</Text>
                              </Text>
                              <Text style={styles.resultDetailText}>
                                Amount: <Text style={styles.bold}>{formatCurrency(result.amountDebited)}</Text>
                              </Text>
                              <Text style={styles.resultDetailText}>
                                Application: <Text style={styles.bold}>{result.applicationNo}</Text>
                              </Text>
                            </>
                          ) : isPending ? (
                            <Text style={styles.resultDetailText}>The final result is not available yet. Try again later.</Text>
                          ) : (
                            <>
                              <Text style={styles.resultDetailText}>No shares allocated.</Text>
                              <Text style={styles.resultDetailText}>{result.refundStatus}</Text>
                            </>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            <Text style={styles.sectionHeading}>How results are shown</Text>
            <View style={styles.guideCard}>
              <GuideRow color="#047857" title="Allotted" text="Shows allotted shares, lots, amount, and application reference." />
              <View style={styles.divider} />
              <GuideRow color="#64748B" title="Not allotted" text="Shows that no shares were allocated and the available refund status." />
              <View style={styles.divider} />
              <GuideRow color="#F59E0B" title="Pending" text="The final allotment result has not been published yet." />
            </View>

            <View style={styles.privacyCard}>
              <Ionicons name="lock-closed-outline" size={17} color={colors.primaryDark} />
              <Text style={styles.privacyText}>
                The app does not generate sample results. PAN data is submitted only when the approved checking service is available and you start a check.
              </Text>
            </View>
            <AdBanner style={{ marginVertical: 10 }} />
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </View>

      <PanManagerModal
        visible={isPanManagerOpen}
        onClose={() => setIsPanManagerOpen(false)}
        accounts={accounts}
        onAddAccount={addAccount}
        onDeleteAccount={deleteAccount}
      />
    </Modal>
  );
};

function GuideRow({ color, title, text }: { color: string; title: string; text: string }) {
  return (
    <View style={styles.guideRow}>
      <View style={[styles.guideDot, { backgroundColor: color }]} />
      <View style={styles.guideTextBox}>
        <Text style={styles.guideTitle}>{title}</Text>
        <Text style={styles.guideText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%', borderWidth: 1, borderColor: colors.border,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconCircle: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: 'transparent',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTextBox: { flex: 1 },
  title: { fontSize: 16, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  closeButton: {
    padding: 6, borderRadius: 8, backgroundColor: 'transparent',
  },
  body: { paddingHorizontal: 20, paddingTop: 16 },
  checkCard: {
    backgroundColor: '#EEF2FF', borderRadius: 16, padding: 16,
    marginBottom: 18, borderWidth: 1, borderColor: '#C7D2FE',
  },
  checkHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6,
  },
  checkTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkTitle: { fontSize: 15, fontWeight: '800', color: colors.primaryDark },
  manageButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    borderWidth: 1, borderColor: '#C7D2FE', gap: 2,
  },
  manageButtonText: { fontSize: 11, fontWeight: '700', color: colors.primaryDark },
  description: { fontSize: 12, color: colors.textSecondary, marginBottom: 10, lineHeight: 16 },
  availabilityBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FFFBEB',
    borderWidth: 1, borderColor: '#FDE68A', borderRadius: 10, padding: 10, marginBottom: 10,
  },
  availabilityBannerLive: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  availabilityTextBox: { flex: 1 },
  availabilityTitle: { color: '#92400E', fontSize: 11.5, fontWeight: '800', marginBottom: 2 },
  availabilityTitleLive: { color: '#047857' },
  availabilityMessage: { color: colors.textSecondary, fontSize: 10.5, lineHeight: 15 },
  panChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  panChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0', gap: 4,
  },
  panChipText: { fontSize: 11, fontWeight: '600', color: colors.text },
  helperText: { color: colors.textSecondary, fontSize: 11, lineHeight: 16, marginBottom: 8 },
  checkButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 12, gap: 8,
  },
  checkButtonDisabled: { backgroundColor: '#94A3B8' },
  checkButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  errorBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginTop: 10,
    padding: 9, borderRadius: 9, backgroundColor: '#FEF2F2',
    borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { flex: 1, color: '#B91C1C', fontSize: 11, lineHeight: 16 },
  progressCard: {
    marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#C7D2FE',
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  progressTitle: { fontSize: 11.5, fontWeight: '800', color: colors.text },
  progressCount: { fontSize: 11, fontWeight: '700', color: colors.primaryDark },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: '#E2E8F0', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },
  progressAccount: { marginTop: 6, fontSize: 10.5, color: colors.textSecondary },
  results: { marginTop: 16, gap: 10 },
  resultsTitle: { fontSize: 13, fontWeight: '800', color: colors.textHeading },
  resultCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, borderWidth: 1.5 },
  resultAllotted: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  resultPending: { borderColor: '#F59E0B', backgroundColor: '#FFFBEB' },
  resultNotAllotted: { borderColor: '#E2E8F0' },
  resultError: { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultName: { fontSize: 13, fontWeight: '800', color: colors.text },
  resultPan: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  resultBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 8, backgroundColor: '#FFFFFF', gap: 4,
  },
  resultBadgeText: { fontSize: 10.5, fontWeight: '800' },
  resultDetails: {
    marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.borderLight, gap: 3,
  },
  resultDetailText: { fontSize: 11.5, color: colors.textSecondary },
  resultErrorText: { fontSize: 11.5, lineHeight: 16, color: '#B91C1C' },
  bold: { fontWeight: '700', color: colors.text },
  sectionHeading: {
    fontSize: 12, fontWeight: '800', color: colors.textSecondary,
    marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  guideCard: {
    backgroundColor: colors.surfaceLight, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.borderLight, marginBottom: 16, gap: 8,
  },
  guideRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  guideDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  guideTextBox: { flex: 1 },
  guideTitle: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 2 },
  guideText: { fontSize: 11, color: colors.textSecondary, lineHeight: 16 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  privacyCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 9, backgroundColor: colors.primaryLight,
    borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#C7D2FE',
  },
  privacyText: { flex: 1, fontSize: 11, lineHeight: 16, color: colors.textSecondary },
  bottomSpacer: { height: 30 },
});
