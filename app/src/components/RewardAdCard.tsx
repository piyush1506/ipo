import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { initRewardedAd, showRewardedAd, isExpoGo, isRewardedAdReady } from '../services/adService';
import { colors } from '../theme/colors';

interface RewardAdCardProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onRewardGranted?: () => void;
  style?: any;
}

export const RewardAdCard: React.FC<RewardAdCardProps> = ({
  title = 'Unlock Instant Allotment & VIP Alerts',
  subtitle = 'Watch a quick 15-30s video to activate priority checks & ad-free perks for today.',
  buttonText = 'Watch Video Ad',
  onRewardGranted,
  style,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [adReady, setAdReady] = useState(isRewardedAdReady());

  useEffect(() => {
    initRewardedAd().then((ready) => {
      setAdReady(ready);
    });
  }, []);

  const handleWatchAd = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsPlaying(true);

      const grantReward = () => {
        setIsUnlocked(true);
        onRewardGranted?.();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          '🎉 Reward Granted!',
          'Thank you for watching! Priority Allotment & VIP perks have been activated.',
          [{ text: 'Awesome!' }]
        );
      };

      const earned = await showRewardedAd(grantReward);

      if (!earned && !isExpoGo) {
        Alert.alert(
          'Video Ad Notice',
          'The ad network could not load a video ad right now (often due to no fill or test network delay).',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Unlock Perks (Test Mode)',
              onPress: grantReward,
            },
          ]
        );
      }
    } catch (err) {
      console.warn('[RewardAdCard] Error playing reward ad:', err);
    } finally {
      setIsPlaying(false);
      setAdReady(isRewardedAdReady());
    }
  };

  return (
    <View style={[styles.card, isUnlocked && styles.cardUnlocked, style]}>
      <View style={styles.contentRow}>
        <View style={[styles.iconBox, isUnlocked && styles.iconBoxUnlocked]}>
          <Ionicons
            name={isUnlocked ? 'checkmark-circle' : 'gift'}
            size={24}
            color={isUnlocked ? colors.success : '#D97706'}
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.badgeRow}>
            <View style={[styles.adBadge, isUnlocked && styles.adBadgeUnlocked]}>
              <Text style={styles.adBadgeText}>{isUnlocked ? 'ACTIVE' : 'REWARD AD'}</Text>
            </View>
            {isExpoGo && !isUnlocked && (
              <Text style={styles.expoGoNotice}>Expo Go Preview</Text>
            )}
            {!isExpoGo && !isUnlocked && (
              <Text style={styles.expoGoNotice}>
                {adReady ? 'Ready to play' : 'Pre-loading...'}
              </Text>
            )}
          </View>
          <Text style={styles.title}>{isUnlocked ? 'VIP Perks Active!' : title}</Text>
          <Text style={styles.subtitle}>
            {isUnlocked
              ? 'Priority server queues & instant notifications are unlocked for this session.'
              : subtitle}
          </Text>
        </View>
      </View>

      {!isUnlocked ? (
        <TouchableOpacity
          style={[styles.actionButton, isPlaying && styles.actionButtonDisabled]}
          onPress={handleWatchAd}
          disabled={isPlaying}
          activeOpacity={0.85}
        >
          {isPlaying ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.buttonText}>Preparing Ad...</Text>
            </>
          ) : (
            <>
              <Ionicons name="play-circle" size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>{buttonText}</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.unlockedFooter}>
          <Ionicons name="sparkles" size={14} color={colors.success} />
          <Text style={styles.unlockedFooterText}>Thank you for supporting the app!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardUnlocked: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBoxUnlocked: {
    backgroundColor: '#DCFCE7',
  },
  textContainer: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  adBadge: {
    backgroundColor: '#D97706',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adBadgeUnlocked: {
    backgroundColor: colors.success,
  },
  adBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  expoGoNotice: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D97706',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 14,
    gap: 8,
  },
  actionButtonDisabled: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  unlockedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
    gap: 6,
  },
  unlockedFooterText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
});
