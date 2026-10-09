import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompanyLogo } from './CompanyLogo';
import { IpoItem } from '../types/ipo';
import { colors } from '../theme/colors';
import {
  formatCurrency,
  formatCrores,
  formatDate,
  getDaysRemainingBadge,
} from '../utils/ipoHelpers';

interface IpoCardProps {
  ipo: IpoItem;
  onPress: () => void;
  onAllotmentPress: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export const IpoCard: React.FC<IpoCardProps> = ({
  ipo,
  onPress,
  onAllotmentPress,
  isSaved = false,
  onToggleSave,
}) => {
  const statusBadge = getDaysRemainingBadge(ipo);
  const companyName = ipo.companyName || ipo.ipoName || 'IPO';

  const isSME = (ipo.issueType || '').toUpperCase() === 'SME';
  const minP = ipo.priceband?.min || 0;
  const maxP = ipo.priceband?.max || ipo.cutoffPrice || minP || 0;
  const lotSize = ipo.lotsize || 1;
  const minInvestment = maxP > 0 && lotSize > 0 ? maxP * lotSize : 0;
  const issueSizeStr = ipo.issuesize ? formatCrores(ipo.issuesize) : 'TBA';

  const rawGmp = ipo.gmp;
  const gmpPrice = typeof rawGmp === 'number'
    ? rawGmp
    : typeof rawGmp?.price === 'number'
    ? rawGmp.price
    : parseFloat(String(rawGmp?.price || '0')) || 0;
  const gmpPercent = typeof rawGmp?.percentage === 'number'
    ? rawGmp.percentage
    : (maxP > 0 && gmpPrice > 0 ? parseFloat(((gmpPrice / maxP) * 100).toFixed(1)) : 0);

  const subVal = typeof ipo.totalSubscription === 'number' 
    ? ipo.totalSubscription 
    : parseFloat(String(ipo.totalSubscription || '0'));
  
  const normStatus = (ipo.status || '').toUpperCase();
  const isUpcoming = normStatus === 'UPCOMING';
  const isClosed = normStatus === 'CLOSED' || (ipo.closedate ? new Date(ipo.closedate).getTime() < new Date().setHours(0, 0, 0, 0) : false);
  const isOpen = !isUpcoming && !isClosed;

  const hasSubscription = !isNaN(subVal) && subVal > 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Top Bar: Company Details & Groww Bookmark */}
      <View style={styles.headerRow}>
        <View style={styles.companyInfoRow}>
          <CompanyLogo companyName={companyName} symbol={ipo.Symbol} logoUrl={ipo.logoUrl || ipo.logo} size={44} />
          <View style={styles.titleContainer}>
            <Text style={styles.companyName} numberOfLines={1}>
              {ipo.companyName || ipo.ipoName}
            </Text>
            <View style={styles.metaRow}>
              <View style={[styles.typeBadge, isSME ? styles.smeBadge : styles.mainboardBadge]}>
                <Text style={[styles.typeBadgeText, isSME ? styles.smeBadgeText : styles.mainboardBadgeText]}>
                  {isSME ? 'SME' : 'Mainboard'}
                </Text>
              </View>
              {ipo.Symbol ? (
                <Text style={styles.symbolText}>• {ipo.Symbol}</Text>
              ) : null}
              {ipo.industry ? (
                <Text style={styles.industryText} numberOfLines={1}>
                  • {ipo.industry}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          {onToggleSave && (
            <TouchableOpacity
              style={styles.starButton}
              onPress={onToggleSave}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={19}
                color={isSaved ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          )}
          <Ionicons name="chevron-forward" size={15} color={colors.textMuted} style={{ marginLeft: 2 }} />
        </View>
      </View>

      {/* Dynamic Status Pill & GMP / Issue Size in Groww Tag Layout */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: 'transparent', borderColor: statusBadge.border },
          ]}
        >
          <Text style={[styles.statusPillText, { color: statusBadge.color }]}>
            {statusBadge.text}
          </Text>
        </View>

        {gmpPrice > 0 ? (
          <View style={styles.gmpTag}>
            <Ionicons name="trending-up" size={13} color={colors.successDark} />
            <Text style={styles.gmpTagText}>
              GMP: ₹{gmpPrice} {gmpPercent > 0 ? `(+${gmpPercent}%)` : ''}
            </Text>
          </View>
        ) : (
          <View style={styles.issueSizeTag}>
            <Ionicons name="pie-chart-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.issueSizeText}>Issue: {issueSizeStr}</Text>
          </View>
        )}
      </View>

      {/* Groww 3-Column Financial Matrix */}
      <View style={styles.financialGrid}>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Price Range</Text>
          <Text style={styles.gridValue}>
            {minP > 0 && maxP > 0
              ? minP === maxP
                ? `₹${minP}`
                : `₹${minP} - ₹${maxP}`
              : 'TBA'}
          </Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Lot Size</Text>
          <Text style={styles.gridValue}>{lotSize} Shares</Text>
        </View>

        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Min. Amount</Text>
          <Text style={[styles.gridValue, styles.highlightValue]}>
            {minInvestment > 0 ? formatCurrency(minInvestment) : 'TBA'}
          </Text>
        </View>
      </View>

      {/* Subscription Demand Info (Clean, No Filler Tube) */}
      {hasSubscription && (
        <View style={styles.subContainer}>
          <View style={styles.subTitleRow}>
            <Ionicons name="flame" size={14} color={subVal >= 3 ? '#F59E0B' : colors.primaryDark} />
            <Text style={styles.subLabel}>Total Subscription</Text>
          </View>
          <Text style={styles.subValue}>
            {subVal.toFixed(2)}x
          </Text>
        </View>
      )}

      {/* Dates Timeline Overview */}
      <View style={styles.datesRow}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Opens</Text>
          <Text style={styles.dateValue}>{formatDate(ipo.opendate)}</Text>
        </View>
        <View style={styles.dateDivider} />
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Closes</Text>
          <Text style={styles.dateValue}>{formatDate(ipo.closedate)}</Text>
        </View>
        <View style={styles.dateDivider} />
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Allotment</Text>
          <Text style={styles.dateValue}>{formatDate(ipo.allotmentdate)}</Text>
        </View>
        <View style={styles.dateDivider} />
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Listing</Text>
          <Text style={styles.dateValue}>{formatDate(ipo.listingdate)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  titleContainer: {
    flex: 1,
  },
  companyName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  mainboardBadge: {
    backgroundColor: 'transparent',
    borderColor: '#93C5FD',
  },
  smeBadge: {
    backgroundColor: 'transparent',
    borderColor: '#C4B5FD',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  mainboardBadgeText: {
    color: colors.primaryDark,
  },
  smeBadgeText: {
    color: colors.growwPurple,
  },
  symbolText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  industryText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  starButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  issueSizeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  issueSizeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  gmpTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    gap: 4,
  },
  gmpTagText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  financialGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  gridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  gridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  highlightValue: {
    color: colors.text,
  },
  subContainer: {
    marginTop: 12,
    backgroundColor: colors.surfaceLight,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  subValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  subTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  subFill: {
    height: '100%',
    borderRadius: 3,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  dateBlock: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textHeading,
  },
  dateDivider: {
    width: 1,
    height: 18,
    backgroundColor: colors.border,
  },
});
