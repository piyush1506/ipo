import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { PanManagerModal } from '../components/PanManagerModal';
import { FAQ_DATA } from '../data/faqData';
import { getAllotmentCapability, AllotmentCapability } from '../api/ipoApi';
import { usePanAccounts } from '../hooks/usePanAccounts';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import { AdBanner } from '../components/AdBanner';
import { TruecallerAdCard } from '../components/TruecallerAdCard';

export const AllotmentScreen: React.FC = () => {
  const { accounts, addAccount, deleteAccount } = usePanAccounts();
  const [isPanManagerOpen, setIsPanManagerOpen] = useState(false);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const { user, login, logout, loading: authLoading } = useAuth();
  const [capability, setCapability] = useState<AllotmentCapability>({
    available: false,
    mode: 'disabled',
    message: 'Checking service availability...',
  });

  useEffect(() => {
    let active = true;
    getAllotmentCapability().then((nextCapability) => {
      if (active) setCapability(nextCapability);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Allotment Hub" subtitle="Prepare automatic PAN checks" />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={capability.available ? 'checkmark-circle' : 'time-outline'}
                size={20}
                color={capability.available ? '#047857' : '#92400E'}
              />
            </View>
            <View style={styles.statusTextBox}>
              <Text style={styles.statusTitle}>
                {capability.available ? 'Automatic checks available' : 'Automatic checks coming soon'}
              </Text>
              <Text style={styles.statusMessage}>{capability.message}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => setIsPanManagerOpen(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="card-outline" size={17} color="#FFFFFF" />
            <Text style={styles.manageButtonText}>Manage PAN profiles ({accounts.length})</Text>
          </TouchableOpacity>
        </View>

        <TruecallerAdCard
          adIndex={2}
          style={{ marginHorizontal: 0, marginVertical: 10 }}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved PAN Profiles</Text>
          <Text style={styles.sectionCount}>{accounts.length}</Text>
        </View>

        {/* Auth Section */}
        <View style={styles.authCard}>
          <Ionicons name="cloud-done-outline" size={24} color={colors.primary} />
          <View style={styles.authTextBox}>
            <Text style={styles.authTitle}>
              {user ? `Cloud Sync: ${user.name || user.email}` : 'Sync across devices'}
            </Text>
            <Text style={styles.authMessage}>
              {user
                ? 'Your PAN profiles are securely backed up.'
                : 'Sign in to save your PAN profiles to the cloud.'}
            </Text>
          </View>
          <TouchableOpacity
            style={user ? styles.authButtonOutlined : styles.authButton}
            onPress={() => {
              if (user) {
                logout();
              } else {
                // Temporary mock login until Google Auth is wired
                login('user@example.com', 'Demo User');
              }
            }}
            disabled={authLoading}
          >
            <Text style={user ? styles.authButtonOutlinedText : styles.authButtonText}>
              {authLoading ? '...' : user ? 'Sign Out' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        {accounts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={28} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No PAN profiles saved</Text>
            <Text style={styles.emptyText}>
              Add your own or family PAN profiles now. No allotment request is sent while the service is unavailable.
            </Text>
          </View>
        ) : (
          <View style={styles.accountList}>
            {accounts.map((account) => (
              <View key={account.id} style={styles.accountCard}>
                <View style={styles.accountIcon}>
                  <Ionicons name="person-outline" size={17} color={colors.primaryDark} />
                </View>
                <View style={styles.accountTextBox}>
                  <Text style={styles.accountName}>{account.holderName}</Text>
                  <Text style={styles.accountPan}>
                    {account.panNumber.substring(0, 5)}****{account.panNumber.substring(9)}
                  </Text>
                </View>
                <Ionicons name="lock-closed-outline" size={15} color={colors.textMuted} />
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primaryDark} />
            <View style={styles.infoTextBox}>
              <Text style={styles.infoTitle}>Permission-safe by design</Text>
              <Text style={styles.infoText}>
                The app never creates sample allotment results. Checks activate only after an approved data API is connected.
              </Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.primaryDark} />
            <View style={styles.infoTextBox}>
              <Text style={styles.infoTitle}>Protected PAN storage</Text>
              <Text style={styles.infoText}>
                PAN profiles are encrypted on Android and iOS and are sent only when you start an available check.
              </Text>
            </View>
          </View>
        </View>

        <AdBanner style={{ marginVertical: 12 }} />

        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {FAQ_DATA.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <TouchableOpacity
                key={faq.id}
                style={styles.faqCard}
                onPress={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </View>
                {isExpanded && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <PanManagerModal
        visible={isPanManagerOpen}
        onClose={() => setIsPanManagerOpen(false)}
        accounts={accounts}
        onAddAccount={addAccount}
        onDeleteAccount={deleteAccount}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 16, paddingTop: 14 },
  statusCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1,
    borderColor: colors.border, marginBottom: 20,
  },
  statusHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  iconCircle: {
    width: 38, height: 38, borderRadius: 11, backgroundColor: '#FFFBEB',
    justifyContent: 'center', alignItems: 'center',
  },
  statusTextBox: { flex: 1 },
  statusTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 3 },
  statusMessage: { fontSize: 12, lineHeight: 17, color: colors.textSecondary },
  manageButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 11, paddingVertical: 12,
  },
  manageButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  authCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border,
    marginBottom: 20, gap: 12,
  },
  authTextBox: { flex: 1 },
  authTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  authMessage: { fontSize: 11, color: colors.textSecondary },
  authButton: {
    backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
  },
  authButtonText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  authButtonOutlined: {
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
  },
  authButtonOutlinedText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '800', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  sectionCount: {
    minWidth: 24, textAlign: 'center', paddingVertical: 2, paddingHorizontal: 7,
    borderRadius: 12, overflow: 'hidden', backgroundColor: colors.primaryLight,
    color: colors.primaryDark, fontSize: 11, fontWeight: '800',
  },
  emptyCard: {
    alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 22,
    borderWidth: 1, borderColor: colors.border, marginBottom: 20,
  },
  emptyTitle: { marginTop: 8, fontSize: 14, fontWeight: '800', color: colors.text },
  emptyText: {
    marginTop: 5, textAlign: 'center', fontSize: 12, lineHeight: 18, color: colors.textSecondary,
  },
  accountList: { gap: 8, marginBottom: 20 },
  accountCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: colors.border,
  },
  accountIcon: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  accountTextBox: { flex: 1 },
  accountName: { fontSize: 13, fontWeight: '800', color: colors.text },
  accountPan: { marginTop: 2, fontSize: 11, fontWeight: '600', color: colors.textMuted },
  infoCard: {
    backgroundColor: colors.surfaceLight, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.borderLight, marginBottom: 22,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoTextBox: { flex: 1 },
  infoTitle: { fontSize: 12.5, fontWeight: '800', color: colors.text, marginBottom: 2 },
  infoText: { fontSize: 11.5, lineHeight: 17, color: colors.textSecondary },
  infoDivider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  faqSection: { gap: 10 },
  faqCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  faqQuestion: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.text, lineHeight: 18 },
  faqAnswer: {
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border,
    fontSize: 12, lineHeight: 19, color: colors.textSecondary,
  },
  bottomSpacer: { height: 110 },
});
