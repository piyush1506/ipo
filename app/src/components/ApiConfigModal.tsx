import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getActiveBaseUrl, setActiveBaseUrl, checkApiHealth } from '../api/ipoApi';
import { colors } from '../theme/colors';

interface ApiConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  visible,
  onClose,
  onSaved,
}) => {
  const [apiUrl, setApiUrl] = useState('');
  const [checking, setChecking] = useState(false);
  const [statusResult, setStatusResult] = useState<{
    online: boolean;
    dbState?: string;
    cacheStatus?: string;
    cachedCount?: number;
    url: string;
  } | null>(null);

  const runHealthCheck = useCallback(async (urlToCheck?: string) => {
    setChecking(true);
    try {
      if (urlToCheck) {
        await setActiveBaseUrl(urlToCheck);
      }
      const res = await checkApiHealth();
      setStatusResult(res);
    } catch {
      setStatusResult({ online: false, url: apiUrl });
    } finally {
      setChecking(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (visible) {
      getActiveBaseUrl().then((url) => {
        setApiUrl(url);
        runHealthCheck(url);
      });
    }
  }, [visible, runHealthCheck]);

  const handleSaveAndTest = async () => {
    if (!apiUrl.trim()) return;
    await setActiveBaseUrl(apiUrl.trim());
    await runHealthCheck(apiUrl.trim());
    onSaved();
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
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="server-outline" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Render Backend API</Text>
                <Text style={styles.subtitle}>Primary Market Live Server</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <Text style={styles.label}>Render Backend URL</Text>
            <Text style={styles.desc}>
              Enter your deployed Render backend URL (e.g. https://your-app.onrender.com)
            </Text>

            <TextInput
              style={styles.input}
              placeholder="https://your-backend.onrender.com"
              placeholderTextColor={colors.textMuted}
              value={apiUrl}
              onChangeText={setApiUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Health Status Box */}
            <View style={styles.statusBox}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusHeaderLabel}>Server Connection Status</Text>
                {checking && <ActivityIndicator size="small" color={colors.primary} />}
              </View>

              {statusResult ? (
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusResult.online ? colors.success : colors.danger },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.statusText,
                        { color: statusResult.online ? colors.success : colors.danger },
                      ]}
                    >
                      {statusResult.online
                        ? '🟢 Render API Online & Synced'
                        : '🔴 Server Unreachable (Check URL / Free Tier Sleeping)'}
                    </Text>
                    {statusResult.online && (
                      <Text style={styles.statusSub}>
                        DB: {statusResult.dbState || 'connected'} • Cache: {statusResult.cacheStatus || 'warm'} ({statusResult.cachedCount || 0} IPOs)
                      </Text>
                    )}
                  </View>
                </View>
              ) : (
                <Text style={styles.testingText}>Tap &quot;Test &amp; Connect&quot; to verify API</Text>
              )}
            </View>

            {/* Render Free Tier Note */}
            <View style={styles.noteBox}>
              <Ionicons name="information-circle-outline" size={16} color={colors.primaryLight} />
              <Text style={styles.noteText}>
                Note: Render free tier services automatically spin down after inactivity. The first request may take 15–30 seconds to wake up the server.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveAndTest}
                disabled={checking}
              >
                {checking ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="sync" size={16} color="#FFFFFF" />
                    <Text style={styles.saveBtnText}>Save & Test Connection</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  desc: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 10,
    lineHeight: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 14,
  },
  statusBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusHeaderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  testingText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
    marginBottom: 16,
  },
  noteText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  actions: {
    gap: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
