import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface TruecallerAdData {
  id: string;
  brand: string;
  title: string;
  description: string;
  rating: string;
  ctaText: string;
  ctaUrl: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
}

const DEFAULT_ADS: TruecallerAdData[] = [
  {
    id: 'groww',
    brand: 'Groww',
    title: 'Groww • Stocks, Mutual Funds & IPOs',
    description: 'Apply for IPOs with 1-click UPI mandate & zero brokerage on equity delivery.',
    rating: '4.6 ★ • 50M+ downloads',
    ctaText: 'INSTALL',
    ctaUrl: 'https://groww.in/',
    iconName: 'trending-up',
    iconColor: '#00D09C',
    iconBg: '#E6FAF5',
  },
  {
    id: 'zerodha',
    brand: 'Zerodha Kite',
    title: 'Zerodha • India’s Leading Stock Broker',
    description: 'Open a free Demat account in 5 minutes. Fast, clean IPO bidding with UPI.',
    rating: '4.7 ★ • 10M+ users',
    ctaText: 'OPEN NOW',
    ctaUrl: 'https://zerodha.com/',
    iconName: 'shield-checkmark',
    iconColor: '#387ED1',
    iconBg: '#EBF3FC',
  },
  {
    id: 'angelone',
    brand: 'Angel One',
    title: 'Angel One SuperApp • Smart Investing',
    description: 'Track live GMP, SME subscriptions and apply to upcoming IPOs effortlessly.',
    rating: '4.5 ★ • 20M+ users',
    ctaText: 'GET APP',
    ctaUrl: 'https://www.angelone.in/',
    iconName: 'flash',
    iconColor: '#FF5722',
    iconBg: '#FFF0EB',
  },
];

interface TruecallerAdCardProps {
  adIndex?: number;
  variant?: 'compact' | 'card';
  style?: any;
}

export const TruecallerAdCard: React.FC<TruecallerAdCardProps> = ({
  adIndex = 0,
  variant = 'card',
  style,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const ad = DEFAULT_ADS[adIndex % DEFAULT_ADS.length];

  if (dismissed) return null;

  const handleCtaPress = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const supported = await Linking.canOpenURL(ad.ctaUrl);
      if (supported) {
        await Linking.openURL(ad.ctaUrl);
      }
    } catch (e) {
      console.warn('[TruecallerAd] Could not open link:', e);
    }
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDismissed(true);
  };

  if (variant === 'compact') {
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={styles.compactLeft}>
          <View style={[styles.iconBox, { backgroundColor: ad.iconBg }]}>
            <Ionicons name={ad.iconName} size={22} color={ad.iconColor} />
          </View>
          <View style={styles.compactTextBox}>
            <View style={styles.brandRow}>
              <View style={styles.adBadge}>
                <Text style={styles.adBadgeText}>Ad</Text>
              </View>
              <Text style={styles.brandName} numberOfLines={1}>
                {ad.brand}
              </Text>
            </View>
            <Text style={styles.compactDescription} numberOfLines={1}>
              {ad.description}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.compactCtaBtn}
          onPress={handleCtaPress}
          activeOpacity={0.8}
        >
          <Text style={styles.compactCtaText}>{ad.ctaText}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Truecaller Full In-Feed Card Style
  return (
    <View style={[styles.cardContainer, style]}>
      {/* Top Header Row with Ad badge and Close */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: ad.iconBg }]}>
            <Ionicons name={ad.iconName} size={24} color={ad.iconColor} />
          </View>
          <View style={styles.headerTextBox}>
            <View style={styles.badgeRow}>
              <View style={styles.adBadge}>
                <Text style={styles.adBadgeText}>Ad</Text>
              </View>
              <Text style={styles.sponsorLabel}>Sponsored</Text>
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {ad.title}
            </Text>
            <Text style={styles.ratingText}>{ad.rating}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Description */}
      <Text style={styles.description}>{ad.description}</Text>

      {/* Bottom CTA Row - Truecaller Signature Blue Pill */}
      <View style={styles.footerRow}>
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={13} color="#0284C7" />
          <Text style={styles.verifiedText}>Verified Sponsor</Text>
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleCtaPress}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaButtonText}>{ad.ctaText}</Text>
          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Truecaller Card Style
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginVertical: 8,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTextBox: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  adBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  adBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
  },
  sponsorLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 1,
  },
  ratingText: {
    fontSize: 10,
    color: '#64748B',
  },
  dismissBtn: {
    padding: 2,
  },
  description: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0284C7', // Truecaller signature blue
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20, // Pill button
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Compact Variant (In-Feed)
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginVertical: 6,
    marginHorizontal: 16,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  compactTextBox: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  brandName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  compactDescription: {
    fontSize: 11,
    color: '#64748B',
  },
  compactCtaBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  compactCtaText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
